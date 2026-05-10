fetch('https://api.quran.com/api/v4/recitations/7/by_chapter/1').then(r=>r.json()).then(d=>console.log(JSON.stringify(d).substring(0, 1000)))
