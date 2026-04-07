const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'https://studyguide.duckdns.org';

export async function streamChat({ message, history, pageContext, subjectSyllabus }, onChunk, onDone, onError) {
  try {
    const res = await fetch(`${PROXY_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, pageContext, subjectSyllabus }),
    });

    if (!res.ok) {
      const err = await res.text();
      onError(err || `Error ${res.status}`);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) onChunk(parsed.content);
            if (parsed.error) onError(parsed.error);
          } catch {
            // Skip malformed lines
          }
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err.message || 'Network error');
  }
}

export async function gradeAnswer({ prompt, studentAnswer, rubric, maxPoints, questionType, courseContext }) {
  const res = await fetch(`${PROXY_URL}/api/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, studentAnswer, rubric, maxPoints, questionType, courseContext }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Error ${res.status}`);
  }

  return res.json();
}

export async function verifyAnswer({ question, studentAnswer, type, options, correct, keyConcepts, modelAnswer }) {
  const res = await fetch(`${PROXY_URL}/api/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, studentAnswer, type, options, correct, keyConcepts, modelAnswer }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Error ${res.status}`);
  }

  return res.json();
}
