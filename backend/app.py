# from dotenv import load_dotenv
# from flask import Flask, request, jsonify, Response, stream_with_context
# from flask_cors import CORS
# import google.generativeai as genai
# from typing import Iterator
# import os
# import sys

# sys.path.append(os.path.dirname(os.path.abspath(__file__ + "/..")))

# # Setup Flask App
# load_dotenv()
# app = Flask(__name__)
# CORS(app, resources={r"/*": {
#     "origins": [
#         "http://localhost:5173",
#         "https://vibeforge.netlify.app"
#     ]
# }})

# # Configure Google Gemini API
# GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
# if not GOOGLE_API_KEY:
#     raise ValueError("Please set the GOOGLE_API_KEY environment variable")

# genai.configure(api_key=GOOGLE_API_KEY)
# model = genai.GenerativeModel('gemini-2.0-flash-exp')

# # Import project templates
# from backend.defaults.node import base_prompt as node_base_prompt
# from backend.defaults.react import base_prompt as react_base_prompt
# from backend.prompts import BASE_PROMPT, getSystemPrompt

# def stream_response(response) -> Iterator[str]:
#     for chunk in response:
#         if chunk.text:
#             yield chunk.text

# def call_model(prompt: str):
#     try:
#         print("\n🟡 Calling Gemini model with prompt snippet:", prompt)  # print first 200 chars
#         response = model.generate_content(prompt)
#         print("✅ Model response received.")
#         return response.text
#     except Exception as e:
#         print("❌ Error during model call:", str(e))
#         raise RuntimeError(f"Model error: {str(e)}")

# @app.route("/template", methods=["POST"])
# def generate_template():
#     try:
#         prompt = request.json.get("prompt", "")
#         print("\n📩 Received template prompt:", prompt)  # First 100 chars

#         if not prompt:
#             return jsonify({"message": "Prompt is required"}), 400

#         project_type_prompt = f"Is the project React or Node? Determine based on the following description return in just one word nothing else: {prompt}"
#         project_type_result = call_model(project_type_prompt).strip().lower()
#         print("🧠 Detected project type:", project_type_result)

#         if project_type_result not in ["react", "node"]:
#             return jsonify({"message": "Invalid project type determined"}), 400

#         base_prompt = react_base_prompt if project_type_result == "react" else node_base_prompt

#         structure_prompt = (
#             f"Provide the detailed structure and complete code for a {project_type_result} project "
#             f"with the complete functionality of the project asked in this prompt: {prompt}"
#         )
#         structure_response = call_model(structure_prompt)

#         if not structure_response:
#             return jsonify({"message": "No project structure returned"}), 500

#         print("📦 Generated project structure successfully.")

#         return jsonify({
#             "prompts": [
#                 BASE_PROMPT,
#                 f"Here is an artifact that contains all files of the project visible to you.\n"
#                 f"Consider the contents of ALL files in the project.\n\n{base_prompt}\n\n"
#                 f"Here is a list of files that exist on the file system but are not being shown to you:\n\n"
#                 f"  - .gitignore\n  - package-lock.json\n",
#             ],
#             "uiPrompts": [base_prompt],
#             "projectCode": structure_response
#         })

#     except Exception as e:
#         print("❌ Error in /template:", str(e))
#         return jsonify({"message": "Internal server error", "details": str(e)}), 500

# @app.route("/chat", methods=["POST"])
# def chat():
#     try:
#         data = request.get_json()
#         messages = data.get("messages", [])

#         if not isinstance(messages, list):
#             return jsonify({"message": "Messages must be an array"}), 400

#         print("\n📩 Chat request received. Number of messages:", len(messages))
#         combined_prompt = "\n".join(f"{msg['role']}: {msg['content']}" for msg in messages)
#         system_prompt_str = getSystemPrompt()
#         final_prompt = f"{system_prompt_str}\n\n{combined_prompt}"

#         response_text = call_model(final_prompt)
#         print(response_text)
#         return jsonify({"response": response_text})

#     except Exception as e:
#         print("❌ Error in /chat:", str(e))
#         return jsonify({"message": "Internal server error", "details": str(e)}), 500

# if __name__ == "__main__":
#     app.run(port=5050, debug=True)









# from dotenv import load_dotenv
# from flask import Flask, request, jsonify, Response, stream_with_context
# from flask_cors import CORS
# import google.generativeai as genai
# from typing import Iterator
# import os
# import sys

# sys.path.append(os.path.dirname(os.path.abspath(__file__ + "/..")))

# # Setup Flask App
# load_dotenv()
# app = Flask(__name__)
# CORS(app, resources={r"/*": {
#     "origins": [
#         "http://localhost:5173",
#         "https://vibeforge.netlify.app"
#     ]
# }})

# # Configure Google Gemini API
# GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
# if not GOOGLE_API_KEY:
#     raise ValueError("Please set the GOOGLE_API_KEY environment variable")

# genai.configure(api_key=GOOGLE_API_KEY)
# model = genai.GenerativeModel('gemini-2.0-flash-exp')

# # Import project templates
# from backend.defaults.node import base_prompt as node_base_prompt
# from backend.defaults.react import base_prompt as react_base_prompt
# from backend.prompts import BASE_PROMPT, getSystemPrompt

# def stream_response(response) -> Iterator[str]:
#     for chunk in response:
#         if chunk.text:
#             yield chunk.text

# def call_model(prompt: str):
#     try:
#         print("\n🟡 Calling Gemini model with prompt snippet:", prompt[:200])  # log first 200 chars
#         response = model.generate_content(prompt)
#         print("✅ Model response received.")
#         return response.text
#     except Exception as e:
#         print("❌ Error during model call:", str(e))
#         raise RuntimeError(f"Model error: {str(e)}")

# @app.route("/template", methods=["POST"])
# def generate_template():
#     try:
#         prompt = request.json.get("prompt", "")
#         print("\n📩 Received template prompt:", prompt[:200])

#         if not prompt:
#             return jsonify({"message": "Prompt is required"}), 400

#         # Step 1: Determine project type
#         project_type_prompt = f"Is the project React or Node? Determine based on the following description return in just one word nothing else: {prompt}"
#         project_type_result = call_model(project_type_prompt).strip().lower()
#         print("🧠 Detected project type:", project_type_result)

#         if project_type_result not in ["react", "node"]:
#             return jsonify({"message": "Invalid project type determined"}), 400

#         base_prompt = react_base_prompt if project_type_result == "react" else node_base_prompt

#         # Step 2: Compose structured artifact prompt
#         artifact_header = (
#             "Here is an artifact that contains all files of the project visible to you.\n"
#             "Consider the contents of ALL files in the project.\n\n"
#             f"{base_prompt}\n\n"
#             "Here is a list of files that exist on the file system but are not being shown to you:\n\n"
#             "  - .gitignore\n  - package-lock.json\n"
#         )

#         structure_prompt = f"{BASE_PROMPT}\n\n{artifact_header}\n\n{prompt}"
#         print("\n📤 Sending full structure prompt to Gemini (snippet):", structure_prompt[:300])

#         # Step 3: Get structured code response
#         structure_response = call_model(structure_prompt)

#         if not structure_response:
#             return jsonify({"message": "No project structure returned"}), 500

#         print("📦 Generated project structure successfully.")

#         return jsonify({
#             "prompts": [
#                 BASE_PROMPT,
#                 artifact_header,
#             ],
#             "uiPrompts": [base_prompt],
#             "projectCode": structure_response
#         })

#     except Exception as e:
#         print("❌ Error in /template:", str(e))
#         return jsonify({"message": "Internal server error", "details": str(e)}), 500

# @app.route("/chat", methods=["POST"])
# def chat():
#     try:
#         data = request.get_json()
#         messages = data.get("messages", [])

#         if not isinstance(messages, list):
#             return jsonify({"message": "Messages must be an array"}), 400

#         print("\n📩 Chat request received. Number of messages:", len(messages))
#         combined_prompt = "\n".join(f"{msg['role']}: {msg['content']}" for msg in messages)
#         system_prompt_str = getSystemPrompt()
#         final_prompt = f"{system_prompt_str}\n\n{combined_prompt}"

#         response_text = call_model(final_prompt)
#         print("💬 Gemini response:", response_text[:200])
#         return jsonify({"response": response_text})

#     except Exception as e:
#         print("❌ Error in /chat:", str(e))
#         return jsonify({"message": "Internal server error", "details": str(e)}), 500

# if __name__ == "__main__":
#     app.run(port=5050, debug=True)































from dotenv import load_dotenv
load_dotenv()
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__ + "/..")))
import google.generativeai as genai
from prompts import BASE_PROMPT, getSystemPrompt
from defaults.node import base_prompt as nodeBasePrompt
from defaults.react import base_prompt as reactBasePrompt



genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel('gemini-2.0-flash-exp')

app = Flask(__name__)
CORS(app)
@app.route('/template', methods=['POST'])
def template():
    data = request.get_json()
    prompt = data.get('prompt')

    # Embed system instruction into prompt directly (Gemini-safe)
    full_prompt = (
        "You are an AI that analyzes project descriptions.\n"
        "Return either the word 'node' or 'react' based on which framework best fits the described project.\n"
        "Return only one word. Do not explain.\n\n"
        f"Project description:\n{prompt}"
    )

    try:
        response = model.generate_content(full_prompt)

        answer = response.text.strip().lower()

        if answer == "react":
            return jsonify({
                "prompts": [
                    BASE_PROMPT,
                    f"Here is an artifact that contains all files of the project visible to you.\n"
                    f"Consider the contents of ALL files in the project.\n\n{reactBasePrompt}\n\n"
                    "Here is a list of files that exist on the file system but are not being shown to you:\n\n"
                    "  - .gitignore\n  - package-lock.json\n"
                ],
                "uiPrompts": [reactBasePrompt]
            })

        elif answer == "node":
            return jsonify({
                "prompts": [
                    f"Here is an artifact that contains all files of the project visible to you.\n"
                    f"Consider the contents of ALL files in the project.\n\n{reactBasePrompt}\n\n"
                    "Here is a list of files that exist on the file system but are not being shown to you:\n\n"
                    "  - .gitignore\n  - package-lock.json\n"
                ],
                "uiPrompts": [nodeBasePrompt]
            })

        return jsonify({"message": f"Invalid classification received: {answer}"}), 403

    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    messages = data.get('messages')

    if not messages or len(messages) == 0:
        print("❌ Error: No messages provided in request")
        return jsonify({"error": "No messages provided"}), 400

    # Insert system prompt as context at the beginning
    system_prompt = getSystemPrompt()
    chat_history = [f"System: {system_prompt}\n"]

    print("✅ Received messages:")
    for msg in messages:
        print(f" - [{msg.get('role')}] {msg.get('content')}")
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "user":
            chat_history.append(f"User: {content}")
        elif role == "assistant":
            chat_history.append(f"Assistant: {content}")

    # Combine all into one Gemini-friendly string
    full_prompt = "\n".join(chat_history)
    print("\n🧠 Final Prompt Sent to Gemini:\n" + full_prompt + "\n")

    try:
        response = model.generate_content(full_prompt)
        print("✅ Gemini Response:\n" + response.text.strip())
        return jsonify({
            "response": response.text.strip()
        })
    except Exception as e:
        print("❌ Error during Gemini generation:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(port=3000)
