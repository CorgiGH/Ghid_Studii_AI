// Dev-only: the visual blocks as the lessons use them, for the ?viz-gallery page.
export default [
 {
  "id": "bd-l01-viz1",
  "widget": "table-map",
  "predict": true,
  "props": {
   "dataset": "facultate",
   "from": "note.nr_matricol",
   "to": "studenti.nr_matricol",
   "question": {
    "en": "At course 24 there is a grade 9. Whose is it?",
    "ro": "La cursul 24 există o notă 9. A cui este?"
   },
   "answerKey": "111"
  }
 },
 {
  "id": "bd-l01a-viz1",
  "widget": "table-build",
  "predict": true,
  "props": {
   "table": "studenti",
   "columns": [
    {
     "name": "nr_matricol",
     "type": "CHAR(6)",
     "notNull": true
    },
    {
     "name": "nume",
     "type": "VARCHAR2(10)"
    },
    {
     "name": "prenume",
     "type": "VARCHAR2(10)"
    },
    {
     "name": "an",
     "type": "NUMBER(1)"
    },
    {
     "name": "grupa",
     "type": "CHAR(2)"
    },
    {
     "name": "bursa",
     "type": "NUMBER(6,2)"
    },
    {
     "name": "data_nastere",
     "type": "DATE"
    }
   ]
  }
 },
 {
  "id": "bd-l01b-viz1",
  "widget": "row-insert",
  "predict": false,
  "props": {
   "table": "studenti",
   "row": {
    "nr_matricol": "126",
    "nume": "Vasile",
    "prenume": "Mihai",
    "an": "2",
    "grupa": "B2",
    "bursa": null,
    "data_nastere": null
   },
   "errorCase": {
    "row": {
     "nr_matricol": null,
     "nume": "Vasile",
     "prenume": "Mihai",
     "an": "2",
     "grupa": "B2",
     "bursa": null,
     "data_nastere": null
    },
    "code": "ORA-01400"
   }
  }
 },
 {
  "id": "bd-l01b-viz2",
  "widget": "delete-sweep",
  "predict": true,
  "props": {
   "table": "note",
   "where": "valoare < 5"
  }
 },
 {
  "id": "bd-l01b-viz3",
  "widget": "delete-sweep",
  "predict": false,
  "props": {
   "table": "note"
  }
 },
 {
  "id": "bd-l06-viz1",
  "widget": "like-slider",
  "predict": false,
  "props": {
   "pattern": "%escu",
   "values": [
    "Popescu",
    "Prelipcean",
    "Antonie",
    "Arhire",
    "Panaite",
    "Bodnar",
    "Archip",
    "Ciobotariu",
    "Bodnar",
    "Pintescu",
    "Arhire",
    "Cobzaru",
    "Bucur"
   ]
  }
 },
 {
  "id": "bd-l06-viz2",
  "widget": "like-slider",
  "predict": true,
  "props": {
   "pattern": "_r%",
   "values": [
    "Popescu",
    "Prelipcean",
    "Antonie",
    "Arhire",
    "Panaite",
    "Bodnar",
    "Archip",
    "Ciobotariu",
    "Bodnar",
    "Pintescu",
    "Arhire",
    "Cobzaru",
    "Bucur"
   ]
  }
 },
 {
  "id": "bd-l07-viz1",
  "widget": "in-between",
  "predict": true,
  "props": {
   "mode": "in",
   "list": [
    "Andrei",
    "Radu",
    "Marius"
   ],
   "values": [
    "Bogdan",
    "Radu",
    "Ioana",
    "Raluca",
    "Alexandru",
    "Ioana",
    "Andrada",
    "Ciprian",
    "Ioana",
    "Andrei",
    "Alexandra",
    "George",
    "Andreea"
   ]
  }
 },
 {
  "id": "bd-l07-viz2",
  "widget": "in-between",
  "predict": true,
  "props": {
   "mode": "between",
   "low": 250,
   "high": 350,
   "values": [
    null,
    null,
    450,
    null,
    null,
    null,
    350,
    350,
    null,
    250,
    null,
    350,
    null
   ]
  }
 },
 {
  "id": "bd-l10-viz1",
  "widget": "number-line",
  "predict": true,
  "props": {
   "values": [
    51.3,
    -51.3
   ],
   "fns": [
    "CEIL",
    "FLOOR",
    "ROUND",
    "TRUNC"
   ],
   "digits": 0
  }
 },
 {
  "id": "bd-l10-viz2",
  "widget": "number-line",
  "predict": false,
  "props": {
   "values": [
    21.365
   ],
   "fns": [
    "ROUND",
    "TRUNC"
   ],
   "digits": 2
  }
 },
 {
  "id": "bd-l10-viz3",
  "widget": "number-line",
  "predict": true,
  "props": {
   "values": [
    21.665,
    25
   ],
   "fns": [
    "ROUND",
    "TRUNC"
   ],
   "digits": -1
  }
 },
 {
  "id": "bd-l01a-viz2",
  "widget": "char-boxes",
  "predict": true,
  "props": {
   "value": "Cosmin",
   "width": 10,
   "ops": [
    "LENGTH"
   ]
  }
 },
 {
  "id": "bd-l11-viz1",
  "widget": "char-boxes",
  "predict": true,
  "props": {
   "value": "Cosmin",
   "width": 10,
   "ops": [
    "LENGTH",
    "TRIM",
    "LIKE"
   ],
   "likePattern": "%n"
  }
 },
 {
  "id": "bd-l12-viz1",
  "widget": "char-strips",
  "predict": true,
  "props": {
   "mode": "pad",
   "input": "Pagina",
   "fn": "LPAD",
   "len": 15,
   "fill": "*."
  }
 },
 {
  "id": "bd-l12-viz2",
  "widget": "char-strips",
  "predict": true,
  "props": {
   "mode": "pad",
   "input": "Pagina",
   "fn": "LPAD",
   "len": 3,
   "fill": "*"
  }
 },
 {
  "id": "bd-l12-viz3",
  "widget": "char-strips",
  "predict": true,
  "props": {
   "mode": "swap",
   "input": "Ciobotariu",
   "from": "ia",
   "to": "ai"
  }
 },
 {
  "id": "bd-l13-v1",
  "widget": "calendar-clock",
  "predict": true,
  "props": {
   "start": "2026-10-26 14:30",
   "ops": [
    {
     "fn": "+",
     "arg": 10
    },
    {
     "fn": "+",
     "arg": "3/24"
    }
   ]
  }
 },
 {
  "id": "bd-l13-v2",
  "widget": "calendar-clock",
  "predict": false,
  "props": {
   "start": "2026-10-26 14:30",
   "ops": [
    {
     "fn": "TRUNC"
    }
   ]
  }
 },
 {
  "id": "bd-l13-v3",
  "widget": "calendar-clock",
  "predict": true,
  "props": {
   "start": "2026-01-31 14:30",
   "ops": [
    {
     "fn": "ADD_MONTHS",
     "arg": 1
    }
   ]
  }
 },
 {
  "id": "bd-l13-v4",
  "widget": "calendar-clock",
  "predict": false,
  "props": {
   "start": "2026-10-26 14:30",
   "ops": [
    {
     "fn": "LAST_DAY"
    },
    {
     "fn": "NEXT_DAY",
     "arg": "MONDAY"
    },
    {
     "fn": "TRUNC",
     "arg": "MM"
    }
   ]
  }
 },
 {
  "id": "bd-l14-v1",
  "widget": "date-mask",
  "predict": true,
  "props": {
   "date": "1995-02-17",
   "masks": [
    "DD-MM-YYYY",
    "DD-MON-YY",
    "Day",
    "DAY",
    "fmDay",
    "Month"
   ]
  }
 },
 {
  "id": "bd-l15-v1",
  "widget": "age-timeline",
  "predict": true,
  "props": {
   "birth": "1995-02-17",
   "today": "2026-10-26 14:30"
  }
 },
 {
  "id": "bd-l16-v1",
  "widget": "decode-sieve",
  "predict": true,
  "props": {
   "expr": "bursa",
   "pairs": [
    [
     450,
     "premiul 1"
    ],
    [
     350,
     "premiul 2"
    ],
    [
     250,
     "premiul 3"
    ]
   ],
   "default": "mentiune",
   "values": [
    450,
    350,
    250,
    null
   ]
  }
 },
 {
  "id": "bd-l17-v1",
  "widget": "type-pipes",
  "predict": true,
  "props": {
   "conversions": [
    {
     "from": "VARCHAR2",
     "to": "NUMBER",
     "value": "'12'",
     "fn": "'12' * 2"
    },
    {
     "from": "NUMBER",
     "to": "VARCHAR2",
     "value": "450",
     "fn": "450 || ' RON'"
    },
    {
     "from": "DATE",
     "to": "VARCHAR2",
     "value": "17-FEB-95",
     "fn": "data_nastere || ''"
    }
   ]
  }
 },
 {
  "id": "bd-l18-viz1",
  "widget": "cartesian-grid",
  "predict": false,
  "props": {
   "left": "studenti",
   "right": "note",
   "on": "studenti.nr_matricol = note.nr_matricol"
  }
 },
 {
  "id": "bd-l19-viz1",
  "widget": "join-wires",
  "predict": false,
  "props": {
   "left": "cursuri",
   "right": "didactic",
   "on": "cursuri.id_curs = didactic.id_curs",
   "kind": "inner"
  }
 },
 {
  "id": "bd-l20-viz1",
  "widget": "join-wires",
  "predict": false,
  "props": {
   "left": "studenti",
   "right": "note",
   "on": "studenti.nr_matricol = note.nr_matricol",
   "kind": "left"
  }
 },
 {
  "id": "bd-l20-viz2",
  "widget": "join-wires",
  "predict": false,
  "props": {
   "left": "studenti",
   "right": "note",
   "on": "studenti.nr_matricol = note.nr_matricol",
   "kind": "left",
   "filterIn": "on",
   "filter": "note.valoare = 10"
  }
 },
 {
  "id": "bd-l20-viz3",
  "widget": "join-wires",
  "predict": false,
  "props": {
   "left": "studenti",
   "right": "note",
   "on": "studenti.nr_matricol = note.nr_matricol",
   "kind": "left",
   "filterIn": "where",
   "filter": "note.valoare = 10"
  }
 },
 {
  "id": "bd-l21-viz1",
  "widget": "self-pairs",
  "predict": false,
  "props": {
   "table": "studenti",
   "pairOn": "TO_CHAR(data_nastere, 'D')",
   "order": "<>"
  }
 },
 {
  "id": "bd-l21-viz2",
  "widget": "self-pairs",
  "predict": true,
  "props": {
   "table": "studenti",
   "pairOn": "TO_CHAR(data_nastere, 'D')",
   "order": "<"
  }
 },
 {
  "id": "bd-l23-viz",
  "widget": "all-vs-some",
  "predict": true,
  "props": {
   "studentsFrom": "studenti",
   "condition": "valoare < 7",
   "showMinusByName": true
  }
 },
 {
  "id": "bd-l09-viz1",
  "widget": "set-balls",
  "predict": true,
  "props": {
   "left": "SELECT nume FROM studenti WHERE an = 2",
   "right": "SELECT nume FROM studenti WHERE an = 3",
   "ops": [
    "UNION",
    "UNION ALL"
   ]
  }
 },
 {
  "id": "bd-l09-viz2",
  "widget": "set-balls",
  "predict": true,
  "props": {
   "left": "SELECT nume FROM studenti WHERE an = 2",
   "right": "SELECT nume FROM studenti WHERE bursa IS NOT NULL",
   "ops": [
    "INTERSECT"
   ]
  }
 },
 {
  "id": "bd-l09-viz3",
  "widget": "set-balls",
  "predict": true,
  "props": {
   "left": "SELECT nume FROM studenti WHERE an = 3",
   "right": "SELECT nume FROM studenti WHERE bursa IS NULL",
   "ops": [
    "MINUS"
   ]
  }
 }
];
