export const config = {
  port: parseInt(process.env.PORT || '4000'),
  cadServerUrl: process.env.CAD_SERVER_URL || 'http://localhost:5000',
  providers: {
    '0g': {
      baseUrl: 'https://router-api-testnet.integratenetwork.work/v1',
      model: 'qwen/qwen2.5-omni-7b',
      apiKey: process.env.OG_API_KEY || '',
    },
    'mimo-pro': {
      baseUrl: 'https://api.xiaomimimo.com/v1',
      model: 'mimo-v2.5-pro',
      apiKey: process.env.MIMO_API_KEY || '',
    },
    'mimo': {
      baseUrl: 'https://api.xiaomimimo.com/v1',
      model: 'mimo-v2.5',
      apiKey: process.env.MIMO_API_KEY || '',
    },
    'mimo-flash': {
      baseUrl: 'https://api.xiaomimimo.com/v1',
      model: 'mimo-v2-flash',
      apiKey: process.env.MIMO_API_KEY || '',
    },
  } as Record<string, { baseUrl: string; model: string; apiKey: string }>,
};
