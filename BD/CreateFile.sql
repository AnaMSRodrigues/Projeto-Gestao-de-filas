CREATE TABLE balcao (
	id_balcao int not null,
	constraint idb_pk primary key(id_balcao)
);

CREATE TABLE gestor (
	id_gestor int not null,
	username varchar(60) not null,
	password varchar(12) not null,
	constraint idg_pk primary key (id_gestor)
);

CREATE TABLE operador (
	id_operador int not null,
	username varchar(60) not null,
	password varchar(12) not null,
	constraint op_pk primary key (id_operador)
);

CREATE TABLE utente (
	id_utente serial,
	constraint ut_pk primary key (id_utente)
);

CREATE TABLE receita (
	n_receita int not null,
	cod_acesso int not null,
	pin_opcao int not null,
	id_utente int,
	constraint nr_pk primary key (n_receita),
	constraint nr_fk foreign key (id_utente) references utente (id_utente)

);

CREATE TABLE servico (
	id_servico int not null,
	tipo varchar(60),
	constraint ids_pk primary key (id_servico)
);

CREATE TABLE produto (
	id_produto int not null,
	lote_produto int not null,
	tipo_produto varchar(60),
	nome_produto varchar(60) not null,
	quantidade_atual int not null,
	quantidade_min int not null,
	id_servico int not null,
	constraint idp_pk primary key (id_produto),
	constraint idp_fk foreign key (id_servico) references servico (id_servico)
	
);

CREATE TABLE senha (
	id_senha serial,
	tipo varchar(60) not null,
	data_senha timestamp default current_timestamp,
	estado varchar(60) not null,
	id_utente int not null,
	id_servico int not null,
	constraint id_s_pk primary key (id_senha),
	constraint ids_ut_fk foreign key (id_utente) references utente (id_utente) on delete cascade,
	constraint ids_s_fk foreign key (id_servico) references servico (id_servico)
	
);

CREATE TABLE chamada(
	id_chamada int not null,
	hora_ini timestamp default current_timestamp,
	hora_fim timestamp,
	atendimento varchar(3),
	id_senha int not null,
	id_operador int not null,
	id_relatorio int,
	data_relatorio date,
	constraint idc_pk primary key (id_chamada),
	constraint ids_ch_fk foreign key (id_senha) references senha (id_senha) on delete cascade,
	constraint ids_op_fk foreign key (id_operador) references operador (id_operador),
	constraint idr_rt_fk foreign key (id_relatorio, data_relatorio) references relatorio (id_relatorio, data_relatorio)
	
);

CREATE TABLE relatorio(
	id_relatorio int not null,
	data_relatorio date,
	relatorio_csv blob,
	constraint rt_pk primary key (id_relatorio, data_relatorio)

);


CREATE TABLE horario(
	id_horario int not null,
	data_horario date,
	estado varchar(60),
	id_gestor int not null,
	id_balcao int not null,
	horario_csv bytea,
	constraint idh_pk primary key (id_horario),
	constraint idg_hor_fk foreign key (id_gestor) references gestor (id_gestor),
	constraint idb_hor_fk foreign key (id_balcao) references balcao (id_balcao)
);

CREATE TABLE turno(
	id_operador int not null,
	id_horario int not null,
	hora_ini timestamp default current_timestamp,
	hora_fim timestamp,
	constraint ido_idh_pk primary key (id_operador,id_horario),
	constraint ido_fk foreign key (id_operador) references operador (id_operador),
	constraint idh_fk foreign key (id_horario) references horario (id_horario)
);
