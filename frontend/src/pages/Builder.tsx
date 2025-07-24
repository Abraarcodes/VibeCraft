import  { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { TabView } from '../components/TabView';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/previewFrame';
import { Step, FileItem, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { Loader } from '../components/Loader';
import { AuroraBackground } from '../components/ui/aurora-background';


export function Builder() {
  const location = useLocation();
  const { prompt } = location.state as { prompt: string };
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<{role: "user" | "assistant", content: string;}[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
  const [steps, setSteps] = useState<Step[]>([]);

  const [files, setFiles] = useState<FileItem[]>([]);

  const [projectCode, setProjectCode] = useState("");  // Add state for projectCode

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps.filter(({status}) => status === "pending").map(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
        let currentFileStructure = [...originalFiles]; // {}
        let finalAnswerRef = currentFileStructure;
  
        let currentFolder = ""
        while(parsedPath.length) {
          currentFolder =  `${currentFolder}/${parsedPath[0]}`;
          let currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);
  
          if (!parsedPath.length) {
            // final file
            let file = currentFileStructure.find(x => x.path === currentFolder)
            if (!file) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'file',
                path: currentFolder,
                content: step.code
              })
            } else {
              file.content = step.code;
            }
          } else {
            /// in a folder
            let folder = currentFileStructure.find(x => x.path === currentFolder)
            if (!folder) {
              // create the folder
              currentFileStructure.push({
                name: currentFolderName,
                type: 'folder',
                path: currentFolder,
                children: []
              })
            }
  
            currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
          }
        }
        originalFiles = finalAnswerRef;
      }

    })

    if (updateHappened) {
      setFiles(originalFiles)
      setSteps(steps => steps.map((s: Step) => {
        return {
          ...s,
          status: "completed"
        }
      }))
    }
  }, [steps, files]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
  
      const processFile = (file: FileItem, isRootFolder: boolean) => {  
        if (file.type === 'folder') {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children ? 
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)]))
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }
        return mountStructure[file.name];
      };
  
      // Process each top-level file/folder
      files.forEach(file => processFile(file, true));
  
      return mountStructure;
    };
  
    const mountStructure = createMountStructure(files);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  async function init() {
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim()
    });
    setTemplateSet(true);
    
    const {prompts, uiPrompts, projectCode} = response.data;  // Extract projectCode

    setProjectCode(projectCode);  // Set the projectCode to state

    setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
      ...x,
      status: "pending"
    })));

    setLoading(true);
    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...prompts, prompt].map(content => ({
        role: "user",
        content
      }))
    })

    setLoading(false);
    setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
      ...x,
      status: "pending" as "pending"
    }))]);

    setLlmMessages([...prompts, prompt].map(content => ({
      role: "user",
      content
    })));

    setLlmMessages(x => [...x, {role: "assistant", content: stepsResponse.data.response}])
  }

  useEffect(() => {
    init();
  }, [])


return (
  <AuroraBackground className="relative bg-[#0f172a] text-white overflow-hidden">
    {/* Main Content */}
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#0d1b2a]/80 border-b border-[#25354a] px-6 py-4 backdrop-blur-xl shadow-md">
        <h1 className="text-2xl font-bold text-[#e0f2fe]">Buildify</h1>
        <p className="text-sm text-[#94a3b8] mt-1">Prompt: {prompt}</p>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-4 gap-6 p-6">
          
          {/* Steps + Prompt Input */}
          <div className="col-span-1 space-y-6 overflow-auto">
            <div className="max-h-[75vh] overflow-y-scroll rounded-2xl bg-[#0d1b2a]/70 border border-[#25354a] p-4 backdrop-blur-xl shadow-inner">
              <StepsList
                steps={steps}
                currentStep={currentStep}
                onStepClick={setCurrentStep}
              />
            </div>

            <div className="rounded-2xl p-4 bg-[#0d1b2a]/70 border border-[#25354a] backdrop-blur-xl shadow-inner space-y-4">
              {(loading || !templateSet) && <Loader />}
              {!(loading || !templateSet) && (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="p-3 bg-[#1e293b] border border-[#334155] text-[#e0f2fe] placeholder-[#94a3b8] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#7fdbff] transition duration-300"
                    placeholder="Enter your prompt..."
                    rows={4}
                  />

                  <button
                    onClick={async () => {
                      const newMessage = {
                        role: "user" as "user",
                        content: userPrompt,
                      };

                      const messagesToSend = [...llmMessages, newMessage];

                      console.log("Sending messages to backend:", messagesToSend);

                      setLoading(true);

                      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
                        messages: messagesToSend,
                      });

                      setLoading(false);

                      setLlmMessages((x) => [...x, newMessage]);
                      setLlmMessages((x) => [
                        ...x,
                        {
                          role: "assistant",
                          content: stepsResponse.data.response,
                        },
                      ]);

                      setSteps((s) => [
                        ...s,
                        ...parseXml(stepsResponse.data.response).map((x) => ({
                          ...x,
                          status: "pending" as "pending",
                        })),
                      ]);
                    }}
                    className="bg-gradient-to-r from-[#8f75ff] to-[#7fdbff] text-white py-2 px-4 rounded-xl hover:scale-105 hover:shadow-[0_0_10px_#7fdbff] transition-all duration-300"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* File Explorer */}
          <div className="col-span-1">
            <FileExplorer files={files} onFileSelect={setSelectedFile} />
          </div>

          {/* Code Editor / Preview */}
          <div className="col-span-2 bg-[#0d1b2a]/80 border border-[#25354a] rounded-2xl shadow-xl p-4 h-[calc(100vh-8rem)] backdrop-blur-xl">
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="h-[calc(100%-4rem)] mt-2">
              {activeTab === 'code' ? (
                <CodeEditor file={selectedFile} />
              ) : (
                <PreviewFrame webContainer={webcontainer!} files={files} />
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  </AuroraBackground>
);

}
