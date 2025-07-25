from dotenv import load_dotenv
load_dotenv()
import os
from flask import Flask, request, jsonify
import re
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
    
    
def clean_gemini_response(text: str) -> str:
    import re

    # General HTML cleanup
    text = re.sub(r'<!\[CDATA\[|\]\]>', '', text)
    text = re.sub(r'<![A-Za-z]+\[?', '', text)
    text = re.sub(r'<!--|-->', '', text)
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&')
    text = text.replace('<br>', '\n').replace('<br/>', '\n').replace('<br />', '\n')

    # Fix malformed closing tags
    text = re.sub(r'</BuildifyArtifac[^>]*', '</BuildifyArtifact>', text)

    # Function to clean code inside BuildifyAction
    def clean_inside_buildify(block_text: str) -> str:
        # Remove <code> and </code>
        block_text = re.sub(r'<code>\s*', '', block_text)
        block_text = re.sub(r'\s*</code>', '', block_text)

        # Remove ``` fenced code blocks
        block_text = re.sub(r'```(?:[a-zA-Z]*)', '', block_text)
        block_text = re.sub(r'```', '', block_text)

        return block_text.strip()

    # Apply cleaning to every BuildifyAction block
    text = re.sub(
        r'(<BuildifyAction[^>]*>)([\s\S]*?)(</BuildifyAction>)',
        lambda m: m.group(1) + clean_inside_buildify(m.group(2)) + m.group(3),
        text
    )

    # Remove stray <code> blocks outside of BuildifyActions
    text = re.sub(r'<code>\s*', '', text)
    text = re.sub(r'\s*</code>', '', text)

    return text.strip()


@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    messages = data.get('messages')

    if not messages or len(messages) == 0:
        print("❌ Error: No messages provided in request")
        return jsonify({"error": "No messages provided"}), 400

    # Insert system prompt
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

    # Add anti-nbsp and anti-html instruction
    anti_html_instructions = (
        "\n\nPlease avoid using &nbsp;, <br>, or any HTML entities in code blocks. "
        "Return only clean JavaScript or TypeScript code as it would appear in a file."
    )
    full_prompt = "\n".join(chat_history) + anti_html_instructions

    print("\n🧠 Final Prompt Sent to Gemini:\n" + full_prompt + "\n")

    try:
        response = model.generate_content(full_prompt)
        raw_output = response.text.strip()
        print("✅ Raw Gemini Response:\n" + raw_output)

        cleaned_output = clean_gemini_response(raw_output)
        print("✅ Cleaned Response Sent to Frontend:\n" + cleaned_output)

        return jsonify({
            "response": cleaned_output
        })

    except Exception as e:
        print("❌ Error during Gemini generation:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=3000)
