console.log('dashboard.js included.')

document.querySelector('#search').addEventListener('click', function () {
    const id = document.querySelector('#complaintid').value;
    window.location.href = '/dashboard/' + id.trim()
});
