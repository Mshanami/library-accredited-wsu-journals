const AZURE_ENDPOINT =
  'https://bmngomezulu-7756-resource.services.ai.azure.com/api/projects/bmngomezulu-7756/applications/LibraryAssistant/protocols/openai/responses?api-version=2025-11-15-preview';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

module.exports = async function (context, req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    context.res = { status: 204, headers: CORS_HEADERS, body: '' };
    return;
  }

  const apiKey = process.env.AZURE_AI_API_KEY;
  if (!apiKey) {
    context.res = {
      status: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'AZURE_AI_API_KEY environment variable is not set.' })
    };
    return;
  }

  const { input, model } = req.body || {};
  if (!input) {
    context.res = {
      status: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Request body must include an "input" field.' })
    };
    return;
  }

  try {
    const upstream = await fetch(AZURE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'gpt-4o',
        input
      })
    });

    const data = await upstream.json();

    context.res = {
      status: upstream.status,
      headers: CORS_HEADERS,
      body: JSON.stringify(data)
    };
  } catch (err) {
    context.log.error('Proxy error:', err);
    context.res = {
      status: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Failed to reach Azure AI Foundry.', detail: err.message })
    };
  }
};
