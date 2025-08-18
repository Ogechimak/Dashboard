// Simple interactivity
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

document.querySelector('.alert-close').addEventListener('click', function() {
    document.querySelector('.alert-banner').style.display = 'none';
});

document.querySelector('.upload-btn').addEventListener('click', function() {
    alert('Excel file upload functionality would be implemented here!\n\nFeatures:\n• Drag & drop Excel files\n• Auto-parse data\n• Smart suggestions\n• Convert to structured forms');
});