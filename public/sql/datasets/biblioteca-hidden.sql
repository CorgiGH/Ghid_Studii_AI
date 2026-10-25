-- A second copy of the Biblioteca tables with the same schema and different rows (see facultate-hidden.sql)

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

-- date fictive; doua perechi cu acelasi nume, un cititor fara imprumuturi, o carte fara autor si un autor fara carte
INSERT INTO cititori VALUES ('c1', 'Popa', 'Radu', 'Iasi', 12.0, TO_DATE('04/11/2022','dd/mm/yyyy'));
INSERT INTO cititori VALUES ('c2', 'Tabacaru', 'Irina', 'Iasi', NULL, TO_DATE('16/01/2023','dd/mm/yyyy'));
INSERT INTO cititori VALUES ('c3', 'Tabacaru', 'Irina', 'Vaslui', 3.5, TO_DATE('16/01/2023','dd/mm/yyyy'));
INSERT INTO cititori VALUES ('c4', 'Neagu', 'Paul', 'Iasi', NULL, TO_DATE('27/05/2023','dd/mm/yyyy'));
INSERT INTO cititori VALUES ('c5', 'Stoica', 'Mara', 'Bacau', NULL, TO_DATE('09/08/2023','dd/mm/yyyy'));
INSERT INTO cititori VALUES ('c6', 'Gavril', 'Tudor', 'Bacau', 20.0, TO_DATE('09/08/2023','dd/mm/yyyy'));
INSERT INTO cititori VALUES ('c7', 'Anton', 'Sara', 'Iasi', NULL, TO_DATE('30/10/2023','dd/mm/yyyy'));
INSERT INTO cititori VALUES ('c8', 'Neagu', 'Ilinca', 'Vaslui', 6.75, TO_DATE('21/02/2024','dd/mm/yyyy'));
INSERT INTO carti VALUES ('b1', 'Ion', 'roman', 1920, 28.5);
INSERT INTO carti VALUES ('b2', 'Morometii', 'roman', 1955, 33.0);
INSERT INTO carti VALUES ('b3', 'Luceafarul', 'poezie', 1883, 19.0);
INSERT INTO carti VALUES ('b4', 'Hanu Ancutei', 'proza', 1928, 21.5);
INSERT INTO carti VALUES ('b5', 'Ultima noapte de dragoste', 'roman', 1930, 31.0);
INSERT INTO carti VALUES ('b6', 'Povestiri', 'proza', 1881, 17.0);
INSERT INTO carti VALUES ('b7', 'Antologie de poezie', 'poezie', 1970, 24.0);
INSERT INTO carti VALUES ('b8', 'Dictionar', 'studiu', 1999, 40.0);
INSERT INTO autori VALUES ('a1', 'Rebreanu', 'Liviu', 'Romania');
INSERT INTO autori VALUES ('a2', 'Preda', 'Marin', 'Romania');
INSERT INTO autori VALUES ('a3', 'Eminescu', 'Mihai', 'Romania');
INSERT INTO autori VALUES ('a4', 'SADOVEANU', 'MIHAIL', 'Romania');
INSERT INTO autori VALUES ('a5', 'Sebastian', 'Mihail', 'Romania');
INSERT INTO autori VALUES ('a6', 'Cartarescu', 'Mircea', 'Romania');
INSERT INTO autori VALUES ('a7', 'Creanga', 'Ion', 'Romania');
INSERT INTO scris VALUES ('a1', 'b1');
INSERT INTO scris VALUES ('a2', 'b2');
INSERT INTO scris VALUES ('a3', 'b3');
INSERT INTO scris VALUES ('a4', 'b4');
INSERT INTO scris VALUES ('a5', 'b5');
INSERT INTO scris VALUES ('a7', 'b6');
INSERT INTO scris VALUES ('a3', 'b7');
INSERT INTO scris VALUES ('a4', 'b7');
INSERT INTO imprumuturi VALUES ('c1', 'b1', TO_DATE('06/02/2024','dd/mm/yyyy'), TO_DATE('20/02/2024','dd/mm/yyyy'), 8);
INSERT INTO imprumuturi VALUES ('c1', 'b3', TO_DATE('06/02/2024','dd/mm/yyyy'), TO_DATE('21/02/2024','dd/mm/yyyy'), 9);
INSERT INTO imprumuturi VALUES ('c1', 'b5', TO_DATE('11/03/2024','dd/mm/yyyy'), NULL, NULL);
INSERT INTO imprumuturi VALUES ('c2', 'b1', TO_DATE('14/01/2024','dd/mm/yyyy'), TO_DATE('29/01/2024','dd/mm/yyyy'), 5);
INSERT INTO imprumuturi VALUES ('c2', 'b2', TO_DATE('13/03/2024','dd/mm/yyyy'), TO_DATE('27/03/2024','dd/mm/yyyy'), 7);
INSERT INTO imprumuturi VALUES ('c3', 'b2', TO_DATE('15/01/2024','dd/mm/yyyy'), TO_DATE('31/01/2024','dd/mm/yyyy'), 6);
INSERT INTO imprumuturi VALUES ('c3', 'b4', TO_DATE('20/03/2023','dd/mm/yyyy'), TO_DATE('04/04/2023','dd/mm/yyyy'), 8);
INSERT INTO imprumuturi VALUES ('c4', 'b4', TO_DATE('01/02/2024','dd/mm/yyyy'), TO_DATE('15/02/2024','dd/mm/yyyy'), 10);
INSERT INTO imprumuturi VALUES ('c4', 'b5', TO_DATE('08/04/2024','dd/mm/yyyy'), TO_DATE('22/04/2024','dd/mm/yyyy'), 4);
INSERT INTO imprumuturi VALUES ('c4', 'b7', TO_DATE('08/04/2024','dd/mm/yyyy'), TO_DATE('23/04/2024','dd/mm/yyyy'), 6);
INSERT INTO imprumuturi VALUES ('c5', 'b3', TO_DATE('19/02/2024','dd/mm/yyyy'), TO_DATE('05/03/2024','dd/mm/yyyy'), 9);
INSERT INTO imprumuturi VALUES ('c5', 'b6', TO_DATE('24/04/2024','dd/mm/yyyy'), NULL, NULL);
INSERT INTO imprumuturi VALUES ('c6', 'b1', TO_DATE('17/04/2024','dd/mm/yyyy'), TO_DATE('01/05/2024','dd/mm/yyyy'), 7);
INSERT INTO imprumuturi VALUES ('c6', 'b7', TO_DATE('17/04/2024','dd/mm/yyyy'), TO_DATE('02/05/2024','dd/mm/yyyy'), 9);
INSERT INTO imprumuturi VALUES ('c8', 'b4', TO_DATE('27/03/2024','dd/mm/yyyy'), TO_DATE('10/04/2024','dd/mm/yyyy'), 5);
