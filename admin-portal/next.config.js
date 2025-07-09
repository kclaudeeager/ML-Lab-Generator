const backendUrl = process.env.NEXT_PUBLIC_API_URL;

module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/export_lab_pdf',
        destination: `${backendUrl}/api/export_lab_pdf`,
      },
      {
        source: '/api/export_lab_docx',
        destination: `${backendUrl}/api/export_lab_docx`,
      },
      {
        source: '/api/save_lab',
        destination: `${backendUrl}/api/save_lab`,
      },
      {
        source: '/api/labs',
        destination: `${backendUrl}/api/labs`,
      },
      {
        source: '/api/labs/:id',
        destination: `${backendUrl}/api/labs/:id`,
      },
    ];
  },
}; 