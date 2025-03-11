runButton = document.getElementById('runButton');
codeAreaJS = document.getElementById('codeFieldJS');
codeAreaHTML = document.getElementById('codeFieldHTML');
codeAreaCSS = document.getElementById('codeFieldCSS');

console.log(codeAreaJS, codeAreaHTML, codeAreaCSS);

codeOutput = document.getElementById('codeOutput');
sandbox = document.getElementById('sandbox');

JScontainer = document.querySelector(".JScontainer")
HTMLcontainer = document.querySelector(".HTMLcontainer")
CSScontainer = document.querySelector(".CSScontainer")

JSButton = document.getElementById('JSButton');
HTMLButton = document.getElementById('HTMLButton');
CSSButton = document.getElementById('CSSButton');

LiveButton = document.getElementById('LiveModeButton')

var LiveMode = false;
var lasRunTime = Date.now();

var jsEditor, htmlEditor, cssEditor;

startingCode = `
// Override console methods
    (function() {
        const originalConsole = console.log;
        console.log = function(...args) {
            window.parent.postMessage({
                type: 'CONSOLELOG',
                data: args
            }, '*');
            return originalConsole.apply(console, args);
        };

        const originalConsoleError = console.error;
        console.error = function(...args) {
            window.parent.postMessage({
                type: 'CONSOLEERROR',
                data: args
            }, '*');
            return originalConsoleError.apply(console, args);
        };

        const originalConsoleWarn = console.warn;
        console.warn = function(...args) {
            window.parent.postMessage({
                type: 'CONSOLEWARN',
                data: args
            }, '*');
            return originalConsoleWarn.apply(console, args);
        };

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', function(event) {
            window.parent.postMessage({
                type: 'CONSOLEERROR',
                data: {
                    message: event.reason.toString(),
                    filename: event.reason.fileName,
                    lineno: event.reason.lineNumber,
                    colno: event.reason.columnNumber
                }
            }, '*');
        });

        // Catch synchronous errors
        window.onerror = function(message, filename, lineno, colno, error) {
            window.parent.postMessage({
                type: 'CONSOLEERROR',
                data: {
                    message: message,
                    error: error,
                    filename: filename,
                    lineno: lineno,
                    colno: colno
                }
            }, '*');
            return true;
        };
    })();
`;


require.config({
    paths: {
        'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.37.0/min/vs'
    }
});

function initEditors() {
    const editorOptions = {
        theme: 'vs-dark',
        fontSize: 14,
        minimap: {
            enabled: false
        },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        autoClosingBrackets: 'always',
        suggestOnTyping: true,
        roundedSelection: false,
        padding: {
            top: 10,
            bottom: 10
        }
    };

    jsEditor = monaco.editor.create(document.getElementById('codeFieldJS'), {
        ...editorOptions,
        language: 'javascript',
        value: '// JavaScript code'
    });

    cssEditor = monaco.editor.create(document.getElementById('codeFieldCSS'), {
        ...editorOptions,
        language: 'css',
        value: `/* CSS code */
body {
    font-family: Arial;
}
        `
    });

    htmlEditor = monaco.editor.create(document.getElementById('codeFieldHTML'), {
        ...editorOptions,
        language: 'html',
        value: `<!-- HTML code -->
<html>
    <head>
        <title>Example</title>
    </head>
    <body>
        <p>Hello World</p>
    </body>
</html>
        `
    });

    // Configure suggestions
    [jsEditor, cssEditor, htmlEditor].forEach(editor => {
        editor.onKeyDown((e) => {
            if (e.ctrlKey && e.key === 'Space') {
                editor.trigger('keyboard', 'actions.showSuggestedActions', {});
            }
        });
    });
    function saveCode() {
        console.log('Saving code...');
        localStorage.setItem('codeAreaJS', jsEditor.getValue());
        localStorage.setItem('codeAreaHTML', htmlEditor.getValue());
        localStorage.setItem('codeAreaCSS', cssEditor.getValue());
    }
    
    function loadCode() {
        console.log('Loading code...');
        jsEditor.setValue(localStorage.getItem('codeAreaJS') || '');
        htmlEditor.setValue(localStorage.getItem('codeAreaHTML') || '');
        cssEditor.setValue(localStorage.getItem('codeAreaCSS') || '');
    }
    
    loadCode();

    function runCode(){
        codeOutput.innerHTML = '';
        sandbox.src = 'about:blank';
        sandbox.onload = function() {
            const doc = sandbox.contentDocument || sandbox.contentWindow.document;
            doc.open();
            doc.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
        ${cssEditor.getValue()}
        </style>
    </head>
    <body>
        ${htmlEditor.getValue()}
        <script>
        ${startingCode}${jsEditor.getValue()}
        </script>
    </body>
    </html>
            `);
            doc.close();
            const iframeWindow = sandbox.contentWindow;
            iframeWindow.addEventListener('error', function(event) {
                console.log('Error in iframe:', event);
                codeOutput.innerHTML += "<p class='error output'>Error: " + event.type + "</p>";
            });
        };
        lasRunTime = Date.now();
    }

    runButton.addEventListener('click', runCode);

editors = [jsEditor, htmlEditor, cssEditor];

editors.forEach(editor => {
    editor.onDidChangeModelContent(saveCode);
})

LiveButton.addEventListener('click', function() {
    LiveMode = !LiveMode;
    if (LiveMode){
        alert("При использовании LiveMode избегайте бесконечных циклов")
        LiveButton.classList.add('activeLMB')
        runCode();
        editors.forEach(editor => {
            editor.onDidChangeModelContent(function() {
                saveCode();
                if (Date.now() - lasRunTime > 500){
                    runCode();
                }
            });
        })

    } else {
        LiveButton.classList.remove('activeLMB')
        editors.forEach(editor => {
            editor.onDidChangeModelContent(saveCode);
        })
    }
});

    
}

require(['vs/editor/editor.main'], initEditors);


function setEditorToJS(){
    JScontainer.classList.remove('inactive')
    HTMLcontainer.classList.add('inactive')
    CSScontainer.classList.add('inactive')
    JSButton.classList.add('activeLB')
    CSSButton.classList.remove('activeLB')
    HTMLButton.classList.remove('activeLB')
}
function setEditorToHTML(){
    JScontainer.classList.add('inactive')
    HTMLcontainer.classList.remove('inactive')
    CSScontainer.classList.add('inactive')
    JSButton.classList.remove('activeLB')
    CSSButton.classList.remove('activeLB')
    HTMLButton.classList.add('activeLB')
}
function setEditorToCSS(){
    JScontainer.classList.add('inactive')
    HTMLcontainer.classList.add('inactive')
    CSScontainer.classList.remove('inactive')
    JSButton.classList.remove('activeLB')
    CSSButton.classList.add('activeLB')
    HTMLButton.classList.remove('activeLB')
}

JSButton.addEventListener('click', setEditorToJS)
HTMLButton.addEventListener('click', setEditorToHTML)
CSSButton.addEventListener('click', setEditorToCSS)

function handleIFrameError(event) {
    codeOutput.innerHTML = '';
    console.log("Error handler called");
    if (event.detail && event.detail.reason) {
        var error = event.detail.reason;
        codeOutput.innerHTML += "<p class='error output'>";
        if (error.message) {
            codeOutput.innerHTML += "<strong>Error:</strong> " + error.message + "<br>";
        }
        if (error.fileName) {
            codeOutput.innerHTML += "<strong>File:</strong> " + error.fileName + "<br>";
        }
        if (error.lineNumber) {
            codeOutput.innerHTML += "<strong>Line:</strong> " + error.lineNumber + "<br>";
        }
        if (error.columnNumber) {
            codeOutput.innerHTML += "<strong>Column:</strong> " + error.columnNumber + "<br>";
        }
        codeOutput.innerHTML += "</p>";
    }
}

sandbox.addEventListener('error', handleIFrameError);


// Catch errors when loading the iframe
sandbox.addEventListener('error', function(event) {
    codeOutput.innerHTML = '';
    codeOutput.innerHTML += "<p class='error output'>Error loading iframe content: " + 
        (event.target.src || 'Unknown error') + "</p>";
});


window.addEventListener('message', function(event) {
    switch (event.data.type) {
        case 'CONSOLELOG':
            codeOutput.innerHTML += "<p class='log output'> >" + event.data.data + "</p>";
            break;
        case 'CONSOLEERROR':
            codeOutput.innerHTML += "<p class='error output'> >" + 
                (event.data.data.message || event.data.data) + "</p>";
            break;
        case 'CONSOLEWARN':
            codeOutput.innerHTML += "<p class='warn output'> >" + event.data.data + "</p>";
            break;
    }
});

