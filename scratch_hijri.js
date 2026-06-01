const date = new Date(2023, 8, 28); // Sept 28, 2023 is 12 Rabiul Awal 1445
const formatter = new Intl.DateTimeFormat('id-TN-u-ca-islamic', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
});
console.log(formatter.format(date));
