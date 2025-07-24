import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState } from 'react';

interface PreviewFrameProps {
  files: any[]; // Replace `any[]` with specific type if available
  webContainer: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const [isFilesLoaded, setIsFilesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  const writeFilesToContainer = async () => {
    try {
      for (const file of files) {
        const { path, content } = file;
        if (content) {
          console.log(`Writing file: ${path}`);
          await webContainer.fs.writeFile(path, content);
        }
      }
      setIsFilesLoaded(true);
    } catch (error) {
      console.error("Error writing files:", error);
      setLoading(false);
    }
  };

  const runBuildCommands = async () => {
    try {
      setLoading(true);

      const installProcess = await webContainer.spawn('npm', ['install']);
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log("npm install output:", data);
          },
        })
      );
      await installProcess.exit;

      const devProcess = await webContainer.spawn('npm', ['run', 'dev']);
      devProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log("npm run dev output:", data);
          },
        })
      );

      webContainer.on('server-ready', (port, url) => {
        console.log(`Server is ready at port: ${port}, URL: ${url}`);
        setUrl(url);
        setLoading(false);
      });
    } catch (error) {
      console.error("Error in WebContainer setup:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (webContainer && files.length > 0) {
      (async () => await writeFilesToContainer())();
    }
  }, [webContainer, files]);

  useEffect(() => {
    if (isFilesLoaded) {
      (async () => await runBuildCommands())();
    }
  }, [isFilesLoaded]);

  return (
    <div className="h-full w-full rounded-2xl bg-[#0d1b2a] border border-[#25354a] backdrop-blur-xl shadow-lg overflow-hidden flex items-center justify-center text-[#94a3b8]">
      {loading ? (
        <div className="text-center animate-pulse">
          <p className="text-[#7fdbff] text-lg font-medium">Launching preview...</p>
        </div>
      ) : (
        url && (
          <iframe
            width="100%"
            height="100%"
            src={url}
            className="rounded-xl border border-[#334155] shadow-md"
          />
        )
      )}
    </div>
  );
}

