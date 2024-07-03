// import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'
// If you enabled Analytics in your project, add the Firebase SDK for Google Analytics
// import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'

const firebaseConfig = {
    apiKey: "AIzaSyDh2qUYqQpAuk3O2ESYDwz6vUa4euiiJvY",
    authDomain: "rokanalytics-a8378.firebaseapp.com",
    databaseURL: "https://rokanalytics-a8378-default-rtdb.firebaseio.com",
    projectId: "rokanalytics-a8378",
    storageBucket: "rokanalytics-a8378.appspot.com",
    messagingSenderId: "982473289455",
    appId: "1:982473289455:web:9969d22a090c87165fb51a",
    measurementId: "G-MN5Q7F350E"
};

firebase.initializeApp(firebaseConfig)

var playersData = []
var playersPrevData = []
var names = {}
var dt;

var dbRef = firebase.database().ref()
dbRef.child("names").get().then(snapshot => {
    names = snapshot.val()
})
dbRef.child("players").get().then(snapshot => {
    playersData = Object.values(snapshot.val())
    dbRef.child("history").limitToFirst(1).get().then(snapshot => {
        playersPrevData = Object.values(snapshot.val())[0]
        loadTable()
    })
})

function updateTagPeriod(text){
    document.getElementById("period").innerHTML = text
}

function updateData(t){
    var child = dbRef.child("history");
    switch(t){
        case 1:
            child = child.child("20240703")
            updateTagPeriod("Data from pass 7 and forwards")
            break
        // case 2:
        //     child = child.child("20240703")
        default:
            child = child.child("20240601")
            updateTagPeriod("Data from all KvK")
    }
    child.get().then(snapshot => {
        playersPrevData = snapshot.val()
        dt.destroy()
        loadTable()
        
    })
}

function loadTable(){
    var nf = Intl.NumberFormat("en-US")
    // console.log(playersPrevData)
    dt = new DataTable('#players', {
        order: [[9, 'desc']],
        layout: {
            topStart: {
                buttons: ['excel', 'pdf']
            }
        },
        columns: [
            { title: "ID", data: 'ID' },
            { title: 'Nick', render: (d, t, r) => {
                return names && names[r.ID] && names[r.ID].Nick || r.Nick
            } },
            { title: 'Alliance', render: (d, t, r) => {
                var m = r.Alliance.match(/\[(.*)\]/)
                return m && m[1] || r.Alliance
            }},
            { title: 'Currrent Power', data: 'Power' },
            { title: 'Current KP', data: 'KP' },
            // { title: 'Current Deads', data: 'Deads'},
            // { title: 'T1 kills', render: function(d, t, r){
            //     return nf.format((r.T1 || 0) / 0.2)
            // } },
            // { title: 'T2 kills', render: function(d, t, r){
            //     return nf.format((r.T2 || 0) / 2)
            // } },
            // { title: 'T3 kills', render: function(d, t, r){
            //     return nf.format((r.T3 || 0) / 4)
            // } },
            // { title: 'T4 kills', render: function(d, t, r){
            //     return nf.format((r.T4 || 0) / 10)
            // } },
            // { title: 'T5 kills', render: function(d, t, r){
            //     return nf.format((r.T5 || 0) / 20)
            // } },
            // { title: 'T2 kills', data: 'T2' },
            // { title: 'T3 kills', data: 'T3' },
            // { title: 'T4 kills', data: 'T4' },
            // { title: 'T5 kills', data: 'T5' },
            {title: 'KP Upgrade', render: function(d, t, r){
                // console.log(playersPrevData[r.ID])
                return playersPrevData[r.ID]? nf.format(r.KP - playersPrevData[r.ID].KP) : 0
            }},
            {title: 'T4 kills', render: function(d, t, r){
                return playersPrevData[r.ID]? nf.format(((r.T4 - playersPrevData[r.ID].T4) || 0) / 10) : 0
            }},
            {title: 'T5 kills', render: function(d, t, r){
                return playersPrevData[r.ID]? nf.format(((r.T5 - playersPrevData[r.ID].T5) || 0) / 20) : 0
            }},
            {title: 'Deads', render: function(d, t, r){
                return playersPrevData[r.ID]? nf.format((r.Deads - playersPrevData[r.ID].Deads) || 0) : 0
            }},
            {title: 'Points', render: function(d, t, r){
                return playersPrevData[r.ID]? nf.format((
                    (r.T4 - playersPrevData[r.ID].T4) / 10 * 4 +
                    (r.T5 - playersPrevData[r.ID].T5) / 20 * 5 +
                    (r.Deads - playersPrevData[r.ID].Deads) * 6.5
                ) || 0) : 0
            }},
        ],
        columnDefs: [
            {
              targets: [3, 4],
              render: $.fn.dataTable.render.number(',', '.', 0, '')
            }],
        data: playersData
    });
}