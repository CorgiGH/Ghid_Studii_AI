-- A second copy of the facultate tables with the same schema and different rows. Exercises are graded on both copies, so a
-- query that only works for the numbers of the lab data (a hard-coded name, a lucky row count) fails here.


CREATE TABLE studenti(
  nr_matricol CHAR(6) NOT NULL,
  nume varchar(10),
  prenume varchar(10),
  an numeric(1,0),
  grupa CHAR(2),
  bursa numeric(6,2),
  data_nastere ora_date
  )
;
CREATE TABLE cursuri(
  id_curs CHAR(4) NOT NULL,
  titlu_curs varchar(15),
  an numeric(1,0),
  semestru numeric(1,0),
  credite numeric(2,0)
  )
;
CREATE TABLE note(
  nr_matricol CHAR(6),
  id_curs CHAR(4),
  valoare numeric(2,0),
  data_notare ora_date
  )
;
CREATE TABLE profesori(
  id_prof CHAR(4),
  nume CHAR(10),
  prenume CHAR(10),
  grad_didactic varchar(5)
  )
;
CREATE TABLE didactic(
  id_prof CHAR(4),
  id_curs CHAR(4)
  )
;

-- anul 3 de studiu
INSERT INTO studenti VALUES ('111', 'Vasilescu', 'Mihai',3, 'A2',300, TO_DATE('08/11/1994', 'dd/mm/yyyy'));
INSERT INTO studenti VALUES ('112', 'Tudose', 'Elena',3, 'A2',NULL, TO_DATE('19/03/1995', 'dd/mm/yyyy'));
INSERT INTO studenti VALUES ('113', 'Ungureanu', 'Paul',3, 'A2',NULL, TO_DATE('30/07/1995', 'dd/mm/yyyy'));
INSERT INTO studenti VALUES ('114', 'Cazacu', 'Diana',3, NULL,450, TO_DATE('14/02/1995', 'dd/mm/yyyy'));
INSERT INTO studenti VALUES ('115', 'Moraru', 'Alexandru',3, 'B3',250, NULL);

-- anul 2 de studiu
INSERT INTO studenti VALUES ('116', 'Lungu', 'Dan',2, 'A1',NULL, TO_DATE('02/10/1996', 'dd/mm/yyyy'));
INSERT INTO studenti VALUES ('117', 'Ursu', 'Elena',2, 'A1',NULL, TO_DATE('23/05/1996', 'dd/mm/yyyy'));
INSERT INTO studenti VALUES ('118', 'Zaharia', 'Cosmin',2, 'A1',350, TO_DATE('17/01/1996', 'dd/mm/yyyy'));
INSERT INTO studenti VALUES ('119', 'Lungu', 'Dan',2, 'B2',350, TO_DATE('11/12/1996', 'dd/mm/yyyy'));
INSERT INTO studenti VALUES ('130', 'Lungu', 'Natalia',2, 'B2',300, TO_DATE('06/03/1996', 'dd/mm/yyyy'));

-- anul 1 de studiu
INSERT INTO studenti VALUES ('120', 'Ungureanu', 'Ioana',1, 'B1',NULL, TO_DATE('09/06/1997', 'dd/mm/yyyy'));
INSERT INTO studenti VALUES ('121', 'Cazacu', 'Victor',1, 'B1',250, TO_DATE('25/09/1997', 'dd/mm/yyyy'));
INSERT INTO studenti VALUES ('122', 'Plesca', 'Maria',1, 'B1',NULL, TO_DATE('04/04/1997', 'dd/mm/yyyy'));
INSERT INTO studenti VALUES ('123', 'Sava', 'Radu',1, 'B2',300, TO_DATE('21/08/1997', 'dd/mm/yyyy'));

-- cursuri: 28 nu are semestru
INSERT INTO cursuri VALUES ('21', 'Logica', 1, 1, 5);
INSERT INTO cursuri VALUES ('22', 'Matematica', 1, 1, 4);
INSERT INTO cursuri VALUES ('23', 'OOP', 1, 2, 5);
INSERT INTO cursuri VALUES ('24', 'BD', 2, 1, 6);
INSERT INTO cursuri VALUES ('25', 'Java', 2, 2, 5);
INSERT INTO cursuri VALUES ('26', 'Tehnologii Web', 2, 2, 4);
INSERT INTO cursuri VALUES ('27', 'Sec. Info.', 3, 1, 5);
INSERT INTO cursuri VALUES ('28', 'DSFUM', 3, NULL, 6);
INSERT INTO cursuri VALUES ('29', 'Limbaje formale', 2, 1, 5);

-- profesori (id-urile p20 si p21 apar de doua ori, ca in copia de laborator)
INSERT INTO profesori VALUES ('p1', 'Masalagiu', 'Cristian', 'Prof');
INSERT INTO profesori VALUES ('p2', 'Buraga', 'Sabin', 'Conf');
INSERT INTO profesori VALUES ('p3', 'Lucanu', 'Dorel', 'Prof');
INSERT INTO profesori VALUES ('p4', 'Tiplea', 'Laurentiu', 'Prof');
INSERT INTO profesori VALUES ('p5', 'Iacob', 'Florin', NULL);
INSERT INTO profesori VALUES ('p6', 'Breaban', 'Mihaela', 'Conf');
INSERT INTO profesori VALUES ('p7', 'Varlan', 'Cosmin', 'Lect');
INSERT INTO profesori VALUES ('p8', 'Frasinaru', 'Cristian', 'Prof');
INSERT INTO profesori VALUES ('p9', 'Ciobaca', 'Stefan', 'Conf');
INSERT INTO profesori VALUES ('p10', 'Captarencu', 'Oana', 'Lect');
INSERT INTO profesori VALUES ('p11', 'Moruz', 'Alexandru', 'Lect');

-- didactic: cursurile 26 si 29 nu au profesor, p10 si p11 nu predau nimic
INSERT INTO didactic VALUES ('p1','21');
INSERT INTO didactic VALUES ('p5','21');
INSERT INTO didactic VALUES ('p9','22');
INSERT INTO didactic VALUES ('p3','23');
INSERT INTO didactic VALUES ('p6','24');
INSERT INTO didactic VALUES ('p7','24');
INSERT INTO didactic VALUES ('p8','25');
INSERT INTO didactic VALUES ('p2','25');
INSERT INTO didactic VALUES ('p4','27');
INSERT INTO didactic VALUES ('p7','28');

-- note: 116 si 123 nu au nicio nota, 120-122 au cate una
INSERT INTO note VALUES ('111', '21',  9, TO_DATE('20/02/2014', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('111', '22',  8, TO_DATE('22/02/2014', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('111', '23',  7, TO_DATE('24/06/2014', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('111', '24', 10, TO_DATE('19/02/2015', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('111', '25',  6, TO_DATE('23/06/2015', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('111', '26',  9, TO_DATE('24/06/2015', 'dd/mm/yyyy'));

INSERT INTO note VALUES ('112', '21',  5, TO_DATE('27/02/2014', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('112', '22',  7, TO_DATE('22/02/2014', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('112', '23',  6, TO_DATE('26/06/2014', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('112', '24',  8, TO_DATE('19/02/2015', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('112', '25',  9, TO_DATE('23/06/2015', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('112', '26',  5, TO_DATE('24/06/2015', 'dd/mm/yyyy'));

INSERT INTO note VALUES ('113', '21', 10, TO_DATE('20/02/2014', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('113', '22',  4, TO_DATE('22/02/2014', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('113', '23',  8, TO_DATE('26/06/2014', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('113', '24',  9, TO_DATE('19/02/2015', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('113', '25',  7, TO_DATE('23/06/2015', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('113', '26',  6, TO_DATE('24/06/2015', 'dd/mm/yyyy'));

INSERT INTO note VALUES ('114', '21',  7, TO_DATE('20/02/2014', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('114', '22',  8, TO_DATE('22/02/2014', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('114', '23',  9, TO_DATE('26/06/2014', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('114', '24',  5, TO_DATE('19/02/2015', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('114', '25', 10, TO_DATE('23/06/2015', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('114', '26',  7, TO_DATE('24/06/2015', 'dd/mm/yyyy'));

INSERT INTO note VALUES ('115', '21',  6, TO_DATE('20/02/2014', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('115', '22', 10, TO_DATE('22/02/2014', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('115', '23',  8, TO_DATE('26/06/2014', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('115', '24',  7, TO_DATE('19/02/2015', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('115', '25',  4, TO_DATE('23/06/2015', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('115', '26',  8, TO_DATE('24/06/2015', 'dd/mm/yyyy'));

INSERT INTO note VALUES ('117', '21',  9, TO_DATE('21/02/2015', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('117', '22',  9, TO_DATE('23/02/2015', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('117', '23',  5, TO_DATE('26/06/2015', 'dd/mm/yyyy'));

INSERT INTO note VALUES ('118', '21',  8, TO_DATE('21/02/2015', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('118', '22',  6, TO_DATE('23/02/2015', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('118', '23',  6, TO_DATE('26/06/2015', 'dd/mm/yyyy'));

INSERT INTO note VALUES ('119', '21',  6, TO_DATE('21/02/2015', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('119', '22',  9, TO_DATE('23/02/2015', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('119', '23', 10, TO_DATE('26/06/2015', 'dd/mm/yyyy'));

INSERT INTO note VALUES ('120', '21',  7, TO_DATE('25/02/2016', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('121', '21',  9, TO_DATE('25/02/2016', 'dd/mm/yyyy'));
INSERT INTO note VALUES ('122', '22',  8, TO_DATE('27/02/2016', 'dd/mm/yyyy'));

INSERT INTO profesori VALUES('p20', 'ANDRIES', 'MARIUS', null);
INSERT INTO profesori VALUES('p21', 'BALAN', 'SIMONA', null);
INSERT INTO profesori VALUES('p22', 'Dascalu', 'EMIL', null);
INSERT INTO profesori VALUES('p20', 'Gavrila', 'Ancuta', null);
INSERT INTO profesori VALUES('p21', 'ROTARU', 'Octavian', null);
