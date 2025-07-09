module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/export_lab_pdf',
        destination: 'http://localhost:3001/api/export_lab_pdf',
      },
      {
        source: '/api/export_lab_docx',
        destination: 'http://localhost:3001/api/export_lab_docx',
      },
    ];
  },
}; 