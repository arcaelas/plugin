#!/usr/bin/env bash
# UserPromptSubmit: detect /rag prefix → force RAG search before processing

INPUT=$(cat)

echo "$INPUT" | node -e "
let d='';
process.stdin.on('data',c=>d+=c);
process.stdin.on('end',()=>{
  try {
    const {prompt} = JSON.parse(d);
    if (!prompt || !prompt.trimStart().startsWith('/rag')) process.exit(0);
    const query = prompt.trimStart().slice(4).trim();
    if (!query) process.exit(0);
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: [
          '[RAG PROTOCOL ACTIVATED]',
          'MANDATORY: Before responding to this message, you MUST call mcp__rag__search at least 3 times with different relevant queries extracted from the user request below.',
          'Wait for ALL search results before taking any action.',
          'Include RAG findings as context for your response.',
          '',
          'User request: ' + query
        ].join('\n')
      }
    }));
  } catch {}
  process.exit(0);
});
"

exit 0
