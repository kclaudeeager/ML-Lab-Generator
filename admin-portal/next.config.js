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
    ];
  },
}; 