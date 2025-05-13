crypto = include_lib("/lib/crypto.so")
networks = get_shell.host_computer.wifi_networks("wlan0")
for index in range(0, networks.len -1 )
	print(index + "-> " + networks[index])
end for
input = user_input("Selecione uma rede: ").to_int
if (typeof(input) == "string" or input < 0 or input > networks.len - 1) then
	exit("Selecione uma opção válida")
end if
network = networks[input].split(" ")
bssid = network[0]
sinal = network[1][:-1].to_int
essid = network[2]
crack = 300000 / (sinal + 15)
crypto.aireplay(bssid, essid, crack)
senha = crypto.aircrack("/home/" + active_user + "/file.cap")
conectado = connect_wifi("wlan0", bssid, essid, senha)
if (conectado) then
	exit("Conectado no wifi " + essid)
else
	exit("Não foi possível se conectar ao wifi selecionado.")
end if
