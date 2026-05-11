fetch('https://api.quran.com/api/v4/chapter_recitations/7/1').then(r=>r.json()).then(d=>console.log(JSON.stringify(d).substring(0, 1000)))
