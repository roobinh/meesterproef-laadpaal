console.log('dashboard.js included.')

document.getElementById('search').addEventListener('click', function() {
    console.log(document.getElementById('complaintid').value)

    var id = document.getElementById('complaintid').value;

    window.location.href = '/dashboard/' + id.trim()
});
