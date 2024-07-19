// src/components/FileUpload.js
import React, { useState } from 'react';
import './FileUpload.css';

function FileUpload() {
    const [file, setFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [question, setQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState([]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (event) => {
            setFileContent(event.target.result);
        };
        reader.readAsText(selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (file) {
            setLoading(true);
            setError('');
            setResult('');
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('http://localhost:3001/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();
                setResult(result.analysis);
            } catch (err) {
                setError('Failed to analyze the file. Please try again.');
            } finally {
                setLoading(false);
            }
        } else {
            setError('Please select a file to upload.');
        }
    };

    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        if (question) {
            setLoading(true);
            setError('');
            const newChatHistory = [...chatHistory, { type: 'user', text: question }];
            setChatHistory(newChatHistory);
            setQuestion('');

            try {
                const response = await fetch('http://localhost:3001/api/question', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ question, context: fileContent }),
                });

                const result = await response.json();
                setChatHistory([...newChatHistory, { type: 'ai', text: result.answer }]);
            } catch (err) {
                setError('Failed to get the answer. Please try again.');
            } finally {
                setLoading(false);
            }
        } else {
            setError('Please enter a question.');
        }
    };

    return (
        <div className="file-upload">
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} className="large-file-input" />
                <button type="submit">Upload</button>
            </form>
            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}
            {result && (
                <div className="content-and-conversation">
                    <div className="document-content">
                        <h3>Document Content:</h3>
                        <pre>{fileContent}</pre>
                        <h3>Analysis Result:</h3>
                        <p>{result}</p>
                    </div>
                    <div className="ai-conversation">
                        <div className="chat-window">
                            {chatHistory.map((chat, index) => (
                                <div key={index} className={`chat-message ${chat.type}`}>
                                    {chat.text}
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleQuestionSubmit}>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Ask a question"
                            />
                            <button type="submit">Ask</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FileUpload;
