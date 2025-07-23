from dotenv import load_dotenv
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import google.generativeai as genai
from typing import Iterator
import os
import sys


sys.path.append(os.path.dirname(os.path.abspath(__file__ + "/..")))
# Setup Flask App
load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Configure Google Gemini API
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("Please set the GOOGLE_API_KEY environment variable")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash-exp')

# Import project templates
from backend.defaults.node import base_prompt as node_base_prompt
from backend.defaults.react import base_prompt as react_base_prompt
from backend.prompts import BASE_PROMPT, getSystemPrompt

def stream_response(response) -> Iterator[str]:
    for chunk in response:
        if chunk.text:
            yield chunk.text


def call_model(prompt: str):
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        raise RuntimeError(f"Model error: {str(e)}")


@app.route("/template", methods=["POST"])
def generate_template():
    try:
        prompt = request.json.get("prompt", "")
        if not prompt:
            return jsonify({"message": "Prompt is required"}), 400

        project_type_prompt = f"Is the project React or Node? Determine based on the following description return in just one word nothing else: {prompt}"
        project_type_result = call_model(project_type_prompt).strip().lower()

        if project_type_result not in ["react", "node"]:
            return jsonify({"message": "Invalid project type determined"}), 400

        base_prompt = react_base_prompt if project_type_result == "react" else node_base_prompt

        structure_prompt = (
            f"Provide the detailed structure and complete code for a {project_type_result} project "
            f"with the complete functionality of the project asked in this prompt: {prompt}"
        )
        structure_response = call_model(structure_prompt)

        if not structure_response:
            return jsonify({"message": "No project structure returned"}), 500

        return jsonify({
            "prompts": [
                BASE_PROMPT,
                f"Here is an artifact that contains all files of the project visible to you.\n"
                f"Consider the contents of ALL files in the project.\n\n{base_prompt}\n\n"
                f"Here is a list of files that exist on the file system but are not being shown to you:\n\n"
                f"  - .gitignore\n  - package-lock.json\n",
            ],
            "uiPrompts": [base_prompt],
            "projectCode": structure_response
        })

    except Exception as e:
        return jsonify({"message": "Internal server error", "details": str(e)}), 500


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        messages = data.get("messages", [])

        if not isinstance(messages, list):
            return jsonify({"message": "Messages must be an array"}), 400

        combined_prompt = "\n".join(f"{msg['role']}: {msg['content']}" for msg in messages)
        system_prompt_str = getSystemPrompt()
        final_prompt = f"{system_prompt_str}\n\n{combined_prompt}"

        response_text = call_model(final_prompt)
        return jsonify({"response": response_text})

    except Exception as e:
        return jsonify({"message": "Internal server error", "details": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5050, debug=True)
