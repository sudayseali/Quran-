fetch('https://api.qurancdn.com/api/qdc/audio/reciters/7/audio_files?chapter=1&segments=true').then(r=>r.json()).then(d=>console.log(JSON.stringify(d).substring(0, 1000))).catch(console.error)
