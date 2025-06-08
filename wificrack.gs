//Description: Script que conecta automaticamente ao wifi.
//Author: Axy

crypto = include_lib("/lib/crypto.so")
shell = get_shell
computador = shell.host_computer
caminho = "/home/" + active_user + "/"
nomeArquivo = "senhas.txt"
senhas = computador.File(caminho+nomeArquivo)
if(senhas == null) then 
	gate = computador.touch(caminho, nomeArquivo)
	senhas = computador.File(caminho+nomeArquivo)
end if
conteudoSenhas = senhas.get_content


//FUNÇÕES
//Conecta no wifi
conectaWifi = function(computador, placaDeRede, bssid, essid, senha)
	resultadoConexao = computador.connect_wifi(placaDeRede, bssid, essid, senha)
	if (typeof(resultadoConexao) == "string") then 
		print("Não foi possível conectar :(" + resultadoConexao)
		return 0
	else
		print("Conexão estabelecida\nI'm in B)")
		return 1
	end if
end function

//Salva senha em arquivo
salvaSenha = function(arquivo, essid, senha, conteudo_anterior, caminho)
	adicionaSenha = arquivo.set_content(conteudo_anterior + char(10) + essid + ":" + senha)
	if (adicionaSenha != 1) then 
		print("Erro ao salvar: " + adicionaSenha)
		return 0
	else
		print("Senha salva com sucesso no arquivo " + caminho)
		return 1
	end if
end function


//TODO: EXIBIR, NO DETALHE DE WIFI, QUAIS REDES JÁ TEM SENHA DISPONÍVEL

//COMEÇO
//Seleção Placa de rede
placas = computador.network_devices.split(char(10)) //char(10) = 'LF'
for item in placas
	print(item)
end for
for index in range(0, placas.len - 2)
	print(index + " -> " + placas[index])
end for
placaDeRede = user_input("Selecione a placa de rede: ").to_int
if (typeof(placaDeRede) == "string" or placaDeRede < 0 or placaDeRede > placas.len - 1) then
   exit("Escolhe direito, cara!")
end if
placaDeRede = placas[placaDeRede].split(char(32))[0] //char(32) = ' '

//Inicializa o Airmon (necessário?)
resultadoAirmon = crypto.airmon("start", placaDeRede)
if typeof(resultadoAirmon) == "string" then print("Erro ao inicializar o airmon. " + airmonResult)

//Scan de Redes
redes = computador.wifi_networks(placaDeRede)
for index in range(0, redes.len - 1)
   print(index + "-> " + redes[index])
end for
wifi = user_input("Selecione o Wifi: ").to_int
if (typeof(wifi) == "string" or wifi < 0 or wifi > redes.len - 1) then
   exit("Escolhe direito, cara!")
end if

// Parsing de dados
parsed = redes[wifi].split(" ")
bssid = parsed[0]
pwr = parsed[1][:-1].to_int
essid = parsed[2]
acksNecessarios = 300000 / (pwr + 15)

//Checa se senha é conhecida
for registro in conteudoSenhas.split(char(10))
	parseRegistro = registro.split(":")
	if essid == parseRegistro[0] then
		resultadoConexao = conectaWifi(computador, placaDeRede, bssid, essid, parseRegistro[1])
		if(resultadoConexao == 1) then exit
	end if
end for
clear_screen()
print("Senha não encontrada no arquivo de senha (" + senhas.path + ")")

//Crack
print("Tentando hackear...")
print("ACKS necessários: " + acksNecessarios)
crypto.aireplay(bssid, essid, acksNecessarios)
senhaWifi = crypto.aircrack("/home/" + active_user + "/file.cap")
print("A senha do wifi " + essid + " é " + senhaWifi)


print("Tentando conectar automaticamente...")
resultadoConexao = conectaWifi(computador, placaDeRede, bssid, essid, senhaWifi)
if(resultadoConexao == 1) then
	print("Salvando nova senha...")
	resultadoSalvarSenha = salvaSenha(senhas, essid, senhaWifi, conteudoSenhas, caminho+nomeArquivo)
else
	print(resultadoConexao)
end if
