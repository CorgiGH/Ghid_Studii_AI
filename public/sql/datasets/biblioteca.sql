-- The Biblioteca practice schema (the mock test), in PostgreSQL spelling like facultate.sql. Titles, years and prices are made up.
-- Same column types as the Oracle script; ora_date is the compat layer's DATE.

CREATE TABLE cititori(
  id_cititor CHAR(4) NOT NULL,
  nume varchar(10),
  prenume varchar(10),
  oras varchar(8),
  taxa numeric(5,2),
  data_inscriere ora_date
  )
;
CREATE TABLE carti(
  id_carte CHAR(4) NOT NULL,
  titlu varchar(25),
  gen varchar(8),
  an_aparitie numeric(4,0),
  pret numeric(6,2)
  )
;
CREATE TABLE autori(
  id_autor CHAR(4) NOT NULL,
  nume CHAR(10),
  prenume CHAR(10),
  tara varchar(8)
  )
;
CREATE TABLE scris(
  id_autor CHAR(4),
  id_carte CHAR(4)
  )
;
CREATE TABLE imprumuturi(
  id_cititor CHAR(4),
  id_carte CHAR(4),
  data_imprumut ora_date,
  data_returnare ora_date,
  apreciere numeric(2,0)
  )
;

-- date fictive (titluri/ani/preturi orientative)
INSERT INTO cititori VALUES ('c1', 'Munteanu', 'Elena', 'Iasi', NULL, TO_DATE('12/09/2023','dd/mm/yyyy'));
INSERT INTO cititori VALUES ('c2', 'Ababei', 'Vlad', 'Iasi', 15.5, TO_DATE('03/10/2023','dd/mm/yyyy'));
INSERT INTO cititori VALUES ('c3', 'Ababei', 'Vlad', 'Iasi', NULL, TO_DATE('03/10/2023','dd/mm/yyyy'));
INSERT INTO cititori VALUES ('c4', 'Dumitru', 'Ion', 'Iasi', 8.0, TO_DATE('21/01/2024','dd/mm/yyyy'));
INSERT INTO cititori VALUES ('c5', 'Sandu', 'Mihai', 'Vaslui', NULL, TO_DATE('13/02/2024','dd/mm/yyyy'));
INSERT INTO cititori VALUES ('c6', 'Lupu', 'Matei', 'Vaslui', NULL, TO_DATE('13/02/2024','dd/mm/yyyy'));
INSERT INTO cititori VALUES ('c7', 'Pavel', 'Ana', 'Bacau', 4.25, TO_DATE('05/03/2024','dd/mm/yyyy'));
INSERT INTO cititori VALUES ('c8', 'Rusu', 'Andrada', 'Iasi', NULL, TO_DATE('05/03/2024','dd/mm/yyyy'));
INSERT INTO carti VALUES ('b1', 'Enigma Otiliei', 'roman', 1938, 35.0);
INSERT INTO carti VALUES ('b2', 'Ion', 'roman', 1920, 28.5);
INSERT INTO carti VALUES ('b3', 'Poezii', 'poezie', 1884, 22.0);
INSERT INTO carti VALUES ('b4', 'Baltagul', 'roman', 1930, 30.0);
INSERT INTO carti VALUES ('b5', 'Amintiri din copilarie', 'proza', 1892, 18.0);
INSERT INTO carti VALUES ('b6', 'Maitreyi', 'roman', 1933, 27.0);
INSERT INTO carti VALUES ('b7', 'Antologie de proza', 'proza', 1950, 25.0);
INSERT INTO carti VALUES ('b8', 'Ghid de lectura', 'studiu', 2001, 15.0);
INSERT INTO autori VALUES ('a1', 'Calinescu', 'George', 'Romania');
INSERT INTO autori VALUES ('a2', 'Rebreanu', 'Liviu', 'Romania');
INSERT INTO autori VALUES ('a3', 'Eminescu', 'Mihai', 'Romania');
INSERT INTO autori VALUES ('a4', 'SADOVEANU', 'MIHAIL', 'Romania');
INSERT INTO autori VALUES ('a5', 'Creanga', 'Ion', 'Romania');
INSERT INTO autori VALUES ('a6', 'Eliade', 'Mircea', 'Romania');
INSERT INTO autori VALUES ('a7', 'Blaga', 'Lucian', 'Romania');
INSERT INTO scris VALUES ('a1', 'b1');
INSERT INTO scris VALUES ('a2', 'b2');
INSERT INTO scris VALUES ('a3', 'b3');
INSERT INTO scris VALUES ('a4', 'b4');
INSERT INTO scris VALUES ('a5', 'b5');
INSERT INTO scris VALUES ('a6', 'b6');
INSERT INTO scris VALUES ('a1', 'b7');
INSERT INTO scris VALUES ('a2', 'b7');
INSERT INTO imprumuturi VALUES ('c1', 'b1', TO_DATE('05/03/2024','dd/mm/yyyy'), TO_DATE('19/03/2024','dd/mm/yyyy'), 9);
INSERT INTO imprumuturi VALUES ('c1', 'b2', TO_DATE('05/03/2024','dd/mm/yyyy'), TO_DATE('20/03/2024','dd/mm/yyyy'), 8);
INSERT INTO imprumuturi VALUES ('c1', 'b6', TO_DATE('09/04/2024','dd/mm/yyyy'), TO_DATE('30/04/2024','dd/mm/yyyy'), 10);
INSERT INTO imprumuturi VALUES ('c2', 'b2', TO_DATE('13/02/2024','dd/mm/yyyy'), TO_DATE('27/02/2024','dd/mm/yyyy'), 6);
INSERT INTO imprumuturi VALUES ('c2', 'b4', TO_DATE('12/03/2024','dd/mm/yyyy'), NULL, NULL);
INSERT INTO imprumuturi VALUES ('c3', 'b1', TO_DATE('13/02/2024','dd/mm/yyyy'), TO_DATE('01/03/2024','dd/mm/yyyy'), 7);
INSERT INTO imprumuturi VALUES ('c3', 'b5', TO_DATE('13/03/2024','dd/mm/yyyy'), TO_DATE('26/03/2024','dd/mm/yyyy'), 8);
INSERT INTO imprumuturi VALUES ('c4', 'b3', TO_DATE('30/01/2024','dd/mm/yyyy'), TO_DATE('14/02/2024','dd/mm/yyyy'), 9);
INSERT INTO imprumuturi VALUES ('c4', 'b4', TO_DATE('05/03/2024','dd/mm/yyyy'), TO_DATE('18/03/2024','dd/mm/yyyy'), 7);
INSERT INTO imprumuturi VALUES ('c4', 'b7', TO_DATE('09/04/2024','dd/mm/yyyy'), TO_DATE('23/04/2024','dd/mm/yyyy'), 7);
INSERT INTO imprumuturi VALUES ('c5', 'b3', TO_DATE('14/03/2024','dd/mm/yyyy'), TO_DATE('27/03/2024','dd/mm/yyyy'), 5);
INSERT INTO imprumuturi VALUES ('c5', 'b5', TO_DATE('02/04/2024','dd/mm/yyyy'), TO_DATE('16/04/2024','dd/mm/yyyy'), 6);
INSERT INTO imprumuturi VALUES ('c7', 'b6', TO_DATE('20/03/2024','dd/mm/yyyy'), TO_DATE('02/04/2024','dd/mm/yyyy'), 9);
INSERT INTO imprumuturi VALUES ('c7', 'b1', TO_DATE('09/04/2024','dd/mm/yyyy'), NULL, NULL);
INSERT INTO imprumuturi VALUES ('c8', 'b2', TO_DATE('26/03/2024','dd/mm/yyyy'), TO_DATE('09/04/2024','dd/mm/yyyy'), 8);
INSERT INTO imprumuturi VALUES ('c8', 'b7', TO_DATE('26/03/2024','dd/mm/yyyy'), TO_DATE('10/04/2024','dd/mm/yyyy'), 10);
