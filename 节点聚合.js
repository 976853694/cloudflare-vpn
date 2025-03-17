// 部署完成后在网址后面加上这个，获取自建节点和机场聚合节点，/?token=auto或/auto或

let mytoken = 'auto';
let guestToken = ''; //可以随便取，或者uuid生成，https://1024tools.com/uuid
let BotToken = ''; //可以为空，或者@BotFather中输入/start，/newbot，并关注机器人
let ChatID = ''; //可以为空，或者@userinfobot中获取，/start
let TG = 0; //小白勿动， 开发者专用，1 为推送所有的访问信息，0 为不推送订阅转换后端的访问信息与异常访问
let FileName = '六趣聚合';
let SUBUpdateTime = 6; //自定义订阅更新时间，单位小时
let total = 99;//TB
let timestamp = 4102329600000;//2099-12-31

//节点链接 + 订阅链接
let MainData = `
https://raw.githubusercontent.com/mfuu/v2ray/master/v2ray
https://raw.githubusercontent.com/peasoft/NoMoreWalls/master/list_raw.txt
https://raw.githubusercontent.com/ermaozi/get_subscribe/main/subscribe/v2ray.txt
https://raw.githubusercontent.com/aiboboxx/v2rayfree/main/v2
https://raw.githubusercontent.com/mahdibland/SSAggregator/master/sub/airport_sub_merge.txt
https://raw.githubusercontent.com/mahdibland/SSAggregator/master/sub/sub_merge.txt
https://raw.githubusercontent.com/Pawdroid/Free-servers/refs/heads/main/sub
`

let urls = [];
let subConverter = "SUBAPI.cmliussss.net"; //在线订阅转换后端，目前使用CM的订阅转换功能。支持自建psub 可自行搭建https://github.com/bulianglin/psub
let subConfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini"; //订阅配置文件
let subProtocol = 'https';

export default {
	async fetch(request, env) {
		const userAgentHeader = request.headers.get('User-Agent');
		const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
		const url = new URL(request.url);
		const token = url.searchParams.get('token');
		mytoken = env.TOKEN || mytoken;
		BotToken = env.TGTOKEN || BotToken;
		ChatID = env.TGID || ChatID;
		TG = env.TG || TG;
		subConverter = env.SUBAPI || subConverter;
		if (subConverter.includes("http://")) {
			subConverter = subConverter.split("//")[1];
			subProtocol = 'http';
		} else {
			subConverter = subConverter.split("//")[1] || subConverter;
		}
		subConfig = env.SUBCONFIG || subConfig;
		FileName = env.SUBNAME || FileName;

		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		const timeTemp = Math.ceil(currentDate.getTime() / 1000);
		const fakeToken = await MD5MD5(`${mytoken}${timeTemp}`);
		guestToken = env.GUESTTOKEN || env.GUEST || guestToken;
		if (!guestToken) guestToken = await MD5MD5(mytoken);
		const 访客订阅 = guestToken;
		//console.log(`${fakeUserID}\n${fakeHostName}`); // 打印fakeID

		let UD = Math.floor(((timestamp - Date.now()) / timestamp * total * 1099511627776) / 2);
		total = total * 1099511627776;
		let expire = Math.floor(timestamp / 1000);
		SUBUpdateTime = env.SUBUPTIME || SUBUpdateTime;

		if (!([mytoken, fakeToken, 访客订阅].includes(token) || url.pathname == ("/" + mytoken) || url.pathname.includes("/" + mytoken + "?"))) {
			if (TG == 1 && url.pathname !== "/" && url.pathname !== "/favicon.ico") await sendMessage(`#异常访问 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgent}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
			if (env.URL302) return Response.redirect(env.URL302, 302);
			else if (env.URL) return await proxyURL(env.URL, url);
			else return new Response(await nginx(), {
				status: 200,
				headers: {
					'Content-Type': 'text/html; charset=UTF-8',
				},
			});
		} else {
			if (env.KV) {
				await 迁移地址列表(env, 'LINK.txt');
				if (userAgent.includes('mozilla') && !url.search) {
					await sendMessage(`#编辑订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
					return await KV(request, env, 'LINK.txt', 访客订阅);
				} else {
					MainData = await env.KV.get('LINK.txt') || MainData;
				}
			} else {
				MainData = env.LINK || MainData;
				if (env.LINKSUB) urls = await ADD(env.LINKSUB);
			}
			let 重新汇总所有链接 = await ADD(MainData + '\n' + urls.join('\n'));
			let 自建节点 = "";
			let 订阅链接 = "";
			for (let x of 重新汇总所有链接) {
				if (x.toLowerCase().startsWith('http')) {
					订阅链接 += x + '\n';
				} else {
					自建节点 += x + '\n';
				}
			}
			MainData = 自建节点;
			urls = await ADD(订阅链接);
			await sendMessage(`#获取订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);

			let 订阅格式 = 'base64';
			if (userAgent.includes('null') || userAgent.includes('subconverter') || userAgent.includes('nekobox') || userAgent.includes(('CF-Workers-SUB').toLowerCase())) {
				订阅格式 = 'base64';
			} else if (userAgent.includes('clash') || (url.searchParams.has('clash') && !userAgent.includes('subconverter'))) {
				订阅格式 = 'clash';
			} else if (userAgent.includes('sing-box') || userAgent.includes('singbox') || ((url.searchParams.has('sb') || url.searchParams.has('singbox')) && !userAgent.includes('subconverter'))) {
				订阅格式 = 'singbox';
			} else if (userAgent.includes('surge') || (url.searchParams.has('surge') && !userAgent.includes('subconverter'))) {
				订阅格式 = 'surge';
			} else if (userAgent.includes('quantumult%20x') || (url.searchParams.has('quanx') && !userAgent.includes('subconverter'))) {
				订阅格式 = 'quanx';
			} else if (userAgent.includes('loon') || (url.searchParams.has('loon') && !userAgent.includes('subconverter'))) {
				订阅格式 = 'loon';
			}

			let subConverterUrl;
			let 订阅转换URL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
			//console.log(订阅转换URL);
			let req_data = MainData;

			let 追加UA = 'v2rayn';
			if (url.searchParams.has('b64') || url.searchParams.has('base64')) 订阅格式 = 'base64';
			else if (url.searchParams.has('clash')) 追加UA = 'clash';
			else if (url.searchParams.has('singbox')) 追加UA = 'singbox';
			else if (url.searchParams.has('surge')) 追加UA = 'surge';
			else if (url.searchParams.has('quanx')) 追加UA = 'Quantumult%20X';
			else if (url.searchParams.has('loon')) 追加UA = 'Loon';

			const 请求订阅响应内容 = await getSUB(urls, request, 追加UA, userAgentHeader);
			console.log(请求订阅响应内容);
			req_data += 请求订阅响应内容[0].join('\n');
			订阅转换URL += "|" + 请求订阅响应内容[1];

			if (env.WARP) 订阅转换URL += "|" + (await ADD(env.WARP)).join("|");
			//修复中文错误
			const utf8Encoder = new TextEncoder();
			const encodedData = utf8Encoder.encode(req_data);
			//const text = String.fromCharCode.apply(null, encodedData);
			const utf8Decoder = new TextDecoder();
			const text = utf8Decoder.decode(encodedData);

			//去重
			const uniqueLines = new Set(text.split('\n'));
			const result = [...uniqueLines].join('\n');
			//console.log(result);

			let base64Data;
			try {
				base64Data = btoa(result);
			} catch (e) {
				function encodeBase64(data) {
					const binary = new TextEncoder().encode(data);
					let base64 = '';
					const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

					for (let i = 0; i < binary.length; i += 3) {
						const byte1 = binary[i];
						const byte2 = binary[i + 1] || 0;
						const byte3 = binary[i + 2] || 0;

						base64 += chars[byte1 >> 2];
						base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
						base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
						base64 += chars[byte3 & 63];
					}

					const padding = 3 - (binary.length % 3 || 3);
					return base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
				}

				base64Data = encodeBase64(result.replace(/\u0026/g, '&'))
			}

			if (订阅格式 == 'base64' || token == fakeToken) {
				return new Response(base64Data, {
					headers: {
						"content-type": "text/plain; charset=utf-8",
						"Profile-Update-Interval": `${SUBUpdateTime}`,
						//"Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
					}
				});
			} else if (订阅格式 == 'clash') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=clash&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'singbox') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=singbox&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'surge') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'quanx') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=quanx&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&udp=true`;
			} else if (订阅格式 == 'loon') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=loon&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false`;
			}
			//console.log(订阅转换URL);
			try {
				const subConverterResponse = await fetch(subConverterUrl);

				if (!subConverterResponse.ok) {
					return new Response(base64Data, {
						headers: {
							"content-type": "text/plain; charset=utf-8",
							"Profile-Update-Interval": `${SUBUpdateTime}`,
							//"Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
						}
					});
					//throw new Error(`Error fetching subConverterUrl: ${subConverterResponse.status} ${subConverterResponse.statusText}`);
				}
				let subConverterContent = await subConverterResponse.text();
				if (订阅格式 == 'clash') subConverterContent = await clashFix(subConverterContent);
				return new Response(subConverterContent, {
					headers: {
						"Content-Disposition": `attachment; filename*=utf-8''${encodeURIComponent(FileName)}`,
						"content-type": "text/plain; charset=utf-8",
						"Profile-Update-Interval": `${SUBUpdateTime}`,
						//"Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,

					},
				});
			} catch (error) {
				return new Response(base64Data, {
					headers: {
						"content-type": "text/plain; charset=utf-8",
						"Profile-Update-Interval": `${SUBUpdateTime}`,
						//"Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
					}
				});
			}
		}
	}
};

async function ADD(envadd) {
	var addtext = envadd.replace(/[	"'|\r\n]+/g, ',').replace(/,+/g, ',');	// 将空格、双引号、单引号和换行符替换为逗号
	//console.log(addtext);
	if (addtext.charAt(0) == ',') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length - 1) == ',') addtext = addtext.slice(0, addtext.length - 1);
	const add = addtext.split(',');
	//console.log(add);
	return add;
}

async function nginx() {
	const text = `
	<!DOCTYPE html>
	<html lang="zh-CN">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>六趣聚合 - 网络优化服务</title>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css">
		<style>
			:root {
				--primary-color: #4facfe;
				--secondary-color: #00f2fe;
				--dark-color: #333;
				--light-color: #fff;
				--card-bg: rgba(255, 255, 255, 0.15);
				--border-radius: 12px;
				--box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
			}
			
			* {
				margin: 0;
				padding: 0;
				box-sizing: border-box;
			}
			
			body {
				font-family: 'PingFang SC', 'Microsoft YaHei', '微软雅黑', '思源黑体', 'Noto Sans SC', '黑体', SimHei, -apple-system, BlinkMacSystemFont, sans-serif;
				background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
				background-attachment: fixed;
				color: var(--dark-color);
				line-height: 1.6;
				min-height: 100vh;
				display: flex;
				flex-direction: column;
			}
			
			.container {
				max-width: 1200px;
				margin: 0 auto;
				padding: 20px;
				width: 100%;
			}
			
			.header {
				text-align: center;
				padding: 50px 0;
				position: relative;
			}
			
			.header h1 {
				font-size: 2.5rem;
				margin-bottom: 10px;
				background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
				-webkit-background-clip: text;
				-webkit-text-fill-color: transparent;
				background-clip: text;
			}
			
			.header p {
				font-size: 1.2rem;
				margin-bottom: 30px;
				opacity: 0.8;
			}
			
			.features {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
				grid-gap: 30px;
				margin-bottom: 50px;
			}
			
			.feature-card {
				background: var(--card-bg);
				backdrop-filter: blur(8px);
				-webkit-backdrop-filter: blur(8px);
				border-radius: var(--border-radius);
				padding: 30px;
				box-shadow: var(--box-shadow);
				border: 1px solid rgba(255, 255, 255, 0.18);
				transition: transform 0.3s ease, box-shadow 0.3s ease;
				display: flex;
				flex-direction: column;
				align-items: center;
				text-align: center;
			}
			
			.feature-card:hover {
				transform: translateY(-5px);
				box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
			}
			
			.feature-icon {
				font-size: 3rem;
				margin-bottom: 20px;
				color: var(--primary-color);
				background: rgba(255, 255, 255, 0.2);
				border-radius: 50%;
				width: 80px;
				height: 80px;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			
			.feature-card h3 {
				font-size: 1.5rem;
				margin-bottom: 15px;
				color: var(--dark-color);
			}
			
			.feature-card p {
				opacity: 0.9;
			}
			
			.cta-section {
				background: var(--card-bg);
				backdrop-filter: blur(8px);
				-webkit-backdrop-filter: blur(8px);
				border-radius: var(--border-radius);
				padding: 50px;
				text-align: center;
				margin-bottom: 50px;
				box-shadow: var(--box-shadow);
				border: 1px solid rgba(255, 255, 255, 0.18);
			}
			
			.cta-section h2 {
				font-size: 2rem;
				margin-bottom: 20px;
				color: var(--dark-color);
			}
			
			.cta-section p {
				margin-bottom: 30px;
				max-width: 700px;
				margin-left: auto;
				margin-right: auto;
				opacity: 0.9;
			}
			
			.btn {
				display: inline-block;
				background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
				color: white;
				text-decoration: none;
				padding: 12px 30px;
				border-radius: 30px;
				font-weight: 600;
				transition: transform 0.3s ease, box-shadow 0.3s ease;
				box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
			}
			
			.btn:hover {
				transform: translateY(-2px);
				box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
			}
			
			.how-it-works {
				margin-bottom: 50px;
			}
			
			.section-title {
				text-align: center;
				font-size: 2rem;
				margin-bottom: 40px;
				color: var(--dark-color);
				position: relative;
			}
			
			.section-title:after {
				content: '';
				display: block;
				width: 100px;
				height: 3px;
				background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
				margin: 15px auto 0;
				border-radius: 3px;
			}
			
			.steps {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
				grid-gap: 30px;
			}
			
			.step-card {
				background: var(--card-bg);
				backdrop-filter: blur(8px);
				-webkit-backdrop-filter: blur(8px);
				border-radius: var(--border-radius);
				padding: 30px;
				box-shadow: var(--box-shadow);
				border: 1px solid rgba(255, 255, 255, 0.18);
				text-align: center;
				position: relative;
			}
			
			.step-number {
				position: absolute;
				top: -15px;
				left: 50%;
				transform: translateX(-50%);
				background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
				color: white;
				width: 30px;
				height: 30px;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				font-weight: bold;
			}
			
			.step-card h3 {
				margin-top: 10px;
				margin-bottom: 15px;
				color: var(--dark-color);
			}
			
			.footer {
				margin-top: auto;
				text-align: center;
				padding: 30px 0;
				background: var(--card-bg);
				backdrop-filter: blur(8px);
				-webkit-backdrop-filter: blur(8px);
				border-top: 1px solid rgba(255, 255, 255, 0.1);
			}
			
			.footer p {
				opacity: 0.7;
			}
			
			@media (max-width: 768px) {
				.header {
					padding: 30px 0;
				}
				
				.header h1 {
					font-size: 2rem;
				}
				
				.cta-section {
					padding: 30px 20px;
				}
				
				.feature-card, .step-card {
					padding: 20px;
				}
			}
		</style>
	</head>
	<body>
		<div class="container">
			<header class="header">
				<h1>六趣聚合</h1>
				<p>让您的网络连接更畅通，体验更丝滑</p>
			</header>
			
			<section class="features">
				<div class="feature-card">
					<div class="feature-icon">
						<i class="ri-speed-line"></i>
					</div>
					<h3>高速连接</h3>
					<p>采用优质线路，为您提供稳定快速的连接体验，告别卡顿和延迟。</p>
				</div>
				
				<div class="feature-card">
					<div class="feature-icon">
						<i class="ri-shield-check-line"></i>
					</div>
					<h3>安全防护</h3>
					<p>全程加密传输，保护您的网络活动，杜绝信息泄露的安全隐患。</p>
				</div>
				
				<div class="feature-card">
					<div class="feature-icon">
						<i class="ri-global-line"></i>
					</div>
					<h3>全球资源</h3>
					<p>汇聚全球节点，轻松访问各类网络服务，畅游无阻碍的互联网世界。</p>
				</div>
			</section>
			
			<section class="cta-section">
				<h2>开始使用六趣聚合</h2>
				<p>只需简单几步，即可体验流畅的网络连接。我们提供多种客户端支持，无论您使用哪种设备，都能轻松配置。</p>
				<a href="你需要跳转的链接" class="btn">立即开始</a>
			</section>
			
			<section class="how-it-works">
				<h2 class="section-title">使用流程</h2>
				<div class="steps">
					<div class="step-card">
						<div class="step-number">1</div>
						<h3>获取订阅</h3>
						<p>登录系统获取专属订阅链接，根据需求选择合适的配置模式。</p>
					</div>
					
					<div class="step-card">
						<div class="step-number">2</div>
						<h3>导入客户端</h3>
						<p>将订阅链接导入您常用的客户端软件，支持多种主流客户端。</p>
					</div>
					
					<div class="step-card">
						<div class="step-number">3</div>
						<h3>启动连接</h3>
						<p>选择适合的节点连接，开始享受高速稳定的网络体验。</p>
					</div>
				</div>
			</section>
		</div>
		
		<footer class="footer">
			<div class="container">
				<p>© ${new Date().getFullYear()} 六趣聚合 - 网络优化服务</p>
			</div>
		</footer>
	</body>
	</html>
	`;
	return text;
}

async function sendMessage(type, ip, add_data = "") {
	if (BotToken !== '' && ChatID !== '') {
		let msg = "";
		const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
		if (response.status == 200) {
			const ipInfo = await response.json();
			msg = `${type}\nIP: ${ip}\n国家: ${ipInfo.country}\n<tg-spoiler>城市: ${ipInfo.city}\n组织: ${ipInfo.org}\nASN: ${ipInfo.as}\n${add_data}`;
		} else {
			msg = `${type}\nIP: ${ip}\n<tg-spoiler>${add_data}`;
		}

		let url = "https://api.telegram.org/bot" + BotToken + "/sendMessage?chat_id=" + ChatID + "&parse_mode=HTML&text=" + encodeURIComponent(msg);
		return fetch(url, {
			method: 'get',
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;',
				'Accept-Encoding': 'gzip, deflate, br',
				'User-Agent': 'Mozilla/5.0 Chrome/90.0.4430.72'
			}
		});
	}
}

function base64Decode(str) {
	const bytes = new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
	const decoder = new TextDecoder('utf-8');
	return decoder.decode(bytes);
}

async function MD5MD5(text) {
	const encoder = new TextEncoder();

	const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
	const firstPassArray = Array.from(new Uint8Array(firstPass));
	const firstHex = firstPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
	const secondPassArray = Array.from(new Uint8Array(secondPass));
	const secondHex = secondPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	return secondHex.toLowerCase();
}

function clashFix(content) {
	if (content.includes('wireguard') && !content.includes('remote-dns-resolve')) {
		let lines;
		if (content.includes('\r\n')) {
			lines = content.split('\r\n');
		} else {
			lines = content.split('\n');
		}

		let result = "";
		for (let line of lines) {
			if (line.includes('type: wireguard')) {
				const 备改内容 = `, mtu: 1280, udp: true`;
				const 正确内容 = `, mtu: 1280, remote-dns-resolve: true, udp: true`;
				result += line.replace(new RegExp(备改内容, 'g'), 正确内容) + '\n';
			} else {
				result += line + '\n';
			}
		}

		content = result;
	}
	return content;
}

async function proxyURL(proxyURL, url) {
	const URLs = await ADD(proxyURL);
	const fullURL = URLs[Math.floor(Math.random() * URLs.length)];

	// 解析目标 URL
	let parsedURL = new URL(fullURL);
	console.log(parsedURL);
	// 提取并可能修改 URL 组件
	let URLProtocol = parsedURL.protocol.slice(0, -1) || 'https';
	let URLHostname = parsedURL.hostname;
	let URLPathname = parsedURL.pathname;
	let URLSearch = parsedURL.search;

	// 处理 pathname
	if (URLPathname.charAt(URLPathname.length - 1) == '/') {
		URLPathname = URLPathname.slice(0, -1);
	}
	URLPathname += url.pathname;

	// 构建新的 URL
	let newURL = `${URLProtocol}://${URLHostname}${URLPathname}${URLSearch}`;

	// 反向代理请求
	let response = await fetch(newURL);

	// 创建新的响应
	let newResponse = new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});

	// 添加自定义头部，包含 URL 信息
	//newResponse.headers.set('X-Proxied-By', 'Cloudflare Worker');
	//newResponse.headers.set('X-Original-URL', fullURL);
	newResponse.headers.set('X-New-URL', newURL);

	return newResponse;
}

async function getSUB(api, request, 追加UA, userAgentHeader) {
	if (!api || api.length === 0) {
		return [];
	} else api = [...new Set(api)]; // 去重
	let newapi = "";
	let 订阅转换URLs = "";
	let 异常订阅 = "";
	const controller = new AbortController(); // 创建一个AbortController实例，用于取消请求
	const timeout = setTimeout(() => {
		controller.abort(); // 2秒后取消所有请求
	}, 2000);

	try {
		// 使用Promise.allSettled等待所有API请求完成，无论成功或失败
		const responses = await Promise.allSettled(api.map(apiUrl => getUrl(request, apiUrl, 追加UA, userAgentHeader).then(response => response.ok ? response.text() : Promise.reject(response))));

		// 遍历所有响应
		const modifiedResponses = responses.map((response, index) => {
			// 检查是否请求成功
			if (response.status === 'rejected') {
				const reason = response.reason;
				if (reason && reason.name === 'AbortError') {
					return {
						status: '超时',
						value: null,
						apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
					};
				}
				console.error(`请求失败: ${api[index]}, 错误信息: ${reason.status} ${reason.statusText}`);
				return {
					status: '请求失败',
					value: null,
					apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
				};
			}
			return {
				status: response.status,
				value: response.value,
				apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
			};
		});

		console.log(modifiedResponses); // 输出修改后的响应数组

		for (const response of modifiedResponses) {
			// 检查响应状态是否为'fulfilled'
			if (response.status === 'fulfilled') {
				const content = await response.value || 'null'; // 获取响应的内容
				if (content.includes('proxies:')) {
					//console.log('Clash订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Clash 配置
				} else if (content.includes('outbounds"') && content.includes('inbounds"')) {
					//console.log('Singbox订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Singbox 配置
				} else if (content.includes('://')) {
					//console.log('明文订阅: ' + response.apiUrl);
					newapi += content + '\n'; // 追加内容
				} else if (isValidBase64(content)) {
					//console.log('Base64订阅: ' + response.apiUrl);
					newapi += base64Decode(content) + '\n'; // 解码并追加内容
				} else {
					const 异常订阅LINK = `trojan://CMLiussss@127.0.0.1:8888?security=tls&allowInsecure=1&type=tcp&headerType=none#%E5%BC%82%E5%B8%B8%E8%AE%A2%E9%98%85%20${response.apiUrl.split('://')[1].split('/')[0]}`;
					console.log('异常订阅: ' + 异常订阅LINK);
					异常订阅 += `${异常订阅LINK}\n`;
				}
			}
		}
	} catch (error) {
		console.error(error); // 捕获并输出错误信息
	} finally {
		clearTimeout(timeout); // 清除定时器
	}

	const 订阅内容 = await ADD(newapi + 异常订阅); // 将处理后的内容转换为数组
	// 返回处理后的结果
	return [订阅内容, 订阅转换URLs];
}

async function getUrl(request, targetUrl, 追加UA, userAgentHeader) {
	// 设置自定义 User-Agent
	const newHeaders = new Headers(request.headers);
	newHeaders.set("User-Agent", `${atob('djJyYXlOLzYuNDU=')} cmliu/CF-Workers-SUB ${追加UA}(${userAgentHeader})`);

	// 构建新的请求对象
	const modifiedRequest = new Request(targetUrl, {
		method: request.method,
		headers: newHeaders,
		body: request.method === "GET" ? null : request.body,
		redirect: "follow",
		cf: {
			// 忽略SSL证书验证
			insecureSkipVerify: true,
			// 允许自签名证书
			allowUntrusted: true,
			// 禁用证书验证
			validateCertificate: false
		}
	});

	// 输出请求的详细信息
	console.log(`请求URL: ${targetUrl}`);
	console.log(`请求头: ${JSON.stringify([...newHeaders])}`);
	console.log(`请求方法: ${request.method}`);
	console.log(`请求体: ${request.method === "GET" ? null : request.body}`);

	// 发送请求并返回响应
	return fetch(modifiedRequest);
}

function isValidBase64(str) {
	// 先移除所有空白字符(空格、换行、回车等)
	const cleanStr = str.replace(/\s/g, '');
	const base64Regex = /^[A-Za-z0-9+/=]+$/;
	return base64Regex.test(cleanStr);
}

async function 迁移地址列表(env, txt = 'ADD.txt') {
	const 旧数据 = await env.KV.get(`/${txt}`);
	const 新数据 = await env.KV.get(txt);

	if (旧数据 && !新数据) {
		// 写入新位置
		await env.KV.put(txt, 旧数据);
		// 删除旧数据
		await env.KV.delete(`/${txt}`);
		return true;
	}
	return false;
}

async function KV(request, env, txt = 'ADD.txt', guest) {
	const url = new URL(request.url);
	try {
		// POST请求处理
		if (request.method === "POST") {
			if (!env.KV) return new Response("未绑定KV空间", { status: 400 });
			try {
				const content = await request.text();
				await env.KV.put(txt, content);
				return new Response("保存成功");
			} catch (error) {
				console.error('保存KV时发生错误:', error);
				return new Response("保存失败: " + error.message, { status: 500 });
			}
		}

		// GET请求部分
		let content = '';
		let hasKV = !!env.KV;

		if (hasKV) {
			try {
				content = await env.KV.get(txt) || '';
			} catch (error) {
				console.error('读取KV时发生错误:', error);
				content = '读取数据时发生错误: ' + error.message;
			}
		}

		const html = `
			<!DOCTYPE html>
			<html>
				<head>
					<title>${FileName} 订阅编辑</title>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<style>
						:root {
							--primary-color: #4CAF50;
							--primary-hover: #45a049;
							--dark-bg: rgba(255, 255, 255, 0.75);
							--card-bg: rgba(255, 255, 255, 0.9);
							--text-color: #333;
							--border-radius: 12px;
							--box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
							--highlight-color: #4facfe;
							--border-color: rgba(0, 0, 0, 0.1);
							--section-bg: rgba(240, 240, 240, 0.5);
						}
						
						* {
							box-sizing: border-box;
							margin: 0;
							padding: 0;
						}
						
						body {
							margin: 0;
							font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
							font-size: 14px;
							line-height: 1.6;
							color: var(--text-color);
							background: #ffffff;
							min-height: 100vh;
							padding: 0;
						}
						
						.toolbar {
							position: sticky;
							top: 0;
							background: var(--dark-bg);
							backdrop-filter: blur(10px);
							-webkit-backdrop-filter: blur(10px);
							border-bottom: 1px solid var(--border-color);
							padding: 12px 20px;
							display: flex;
							justify-content: space-between;
							align-items: center;
							z-index: 1000;
							box-shadow: var(--box-shadow);
						}
						
						.toolbar-title {
							font-size: 18px;
							font-weight: 600;
							color: var(--text-color);
						}
						
						.toolbar-actions {
							display: flex;
							gap: 10px;
						}
						
						.container {
							max-width: 1200px;
							margin: 0 auto;
							padding: 20px;
						}
						
						.header {
							text-align: center;
							margin-bottom: 30px;
							padding-bottom: 15px;
							border-bottom: 1px solid var(--border-color);
						}
						
						.header h1 {
							font-size: 24px;
							margin-bottom: 5px;
							color: var(--text-color);
						}
						
						.header p {
							color: #666;
							font-size: 14px;
						}
						
						.module {
							background: var(--card-bg);
							backdrop-filter: blur(4px);
							-webkit-backdrop-filter: blur(4px);
							border-radius: var(--border-radius);
							margin-bottom: 20px;
							border: 1px solid var(--border-color);
							overflow: hidden;
							transition: box-shadow 0.3s;
						}
						
						.module:hover {
							box-shadow: var(--box-shadow);
						}
						
						.module-header {
							padding: 15px 20px;
							border-bottom: 1px solid var(--border-color);
							background: var(--section-bg);
							display: flex;
							justify-content: space-between;
							align-items: center;
							cursor: pointer;
							user-select: none;
						}
						
						.module-header h2 {
							font-size: 16px;
							font-weight: 600;
							color: var(--text-color);
							margin: 0;
						}
						
						.module-icon {
							width: 24px;
							height: 24px;
							display: flex;
							align-items: center;
							justify-content: center;
							border-radius: 50%;
							background: var(--highlight-color);
							color: white;
							font-size: 14px;
							transition: transform 0.3s;
						}
						
						.module-content {
							padding: 20px;
							display: none;
						}
						
						.module.active .module-content {
							display: block;
						}
						
						.module.active .module-icon {
							transform: rotate(180deg);
						}
						
						.sub-list {
							display: grid;
							grid-template-columns: 1fr;
							gap: 15px;
						}
						
						@media (min-width: 768px) {
							.sub-list {
								grid-template-columns: repeat(2, 1fr);
							}
						}
						
						@media (min-width: 1200px) {
							.sub-list {
								grid-template-columns: repeat(3, 1fr);
							}
						}
						
						.sub-item {
							margin-bottom: 15px;
						}
						
						.sub-item a {
							display: inline-block;
							color: var(--highlight-color);
							text-decoration: none;
							margin-bottom: 5px;
							transition: color 0.3s;
							font-weight: 500;
							border-bottom: 1px dashed rgba(79, 172, 254, 0.3);
							padding-bottom: 2px;
						}
						
						.sub-item a:hover {
							color: #0056b3;
						}
						
						.qrcode-container {
							margin: 10px 0;
							display: flex;
							justify-content: center;
						}
						
						.divider {
							height: 1px;
							background: var(--border-color);
							margin: 15px 0;
						}
						
						.section-title {
							font-size: 16px;
							margin: 20px 0 10px;
							color: var(--text-color);
							font-weight: 500;
						}
						
						button {
							background: var(--primary-color);
							color: white;
							border: none;
							padding: 8px 16px;
							border-radius: 4px;
							cursor: pointer;
							transition: all 0.3s;
							font-weight: 500;
						}
						
						button:hover {
							background: var(--primary-hover);
							box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
						}
						
						.toggle-btn {
							background: transparent;
							color: var(--highlight-color);
							border: 1px solid var(--highlight-color);
							padding: 6px 12px;
							font-size: 13px;
							border-radius: 4px;
						}
						
						.toggle-btn:hover {
							background: rgba(79, 172, 254, 0.1);
						}
						
						.editor-container {
							width: 100%;
							margin: 20px 0;
						}
						
						.editor {
							width: 100%;
							height: 300px;
							padding: 15px;
							background: rgba(240, 240, 240, 0.5);
							border: 1px solid var(--border-color);
							border-radius: 8px;
							color: #333;
							font-size: 14px;
							line-height: 1.6;
							resize: vertical;
							font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
						}
						
						.editor:focus {
							outline: none;
							border-color: rgba(79, 172, 254, 0.5);
							box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
						}
						
						.save-container {
							display: flex;
							align-items: center;
							gap: 15px;
							margin-top: 10px;
						}
						
						.save-btn {
							background: var(--primary-color);
							padding: 8px 20px;
							border-radius: 6px;
						}
						
						.save-status {
							color: #666;
						}
						
						.config-item {
							margin: 10px 0;
						}
						
						.config-item strong {
							color: var(--highlight-color);
							font-weight: 500;
						}
						
						.footer {
							text-align: center;
							margin-top: 30px;
							padding: 20px;
							border-top: 1px solid var(--border-color);
							color: #666;
							font-size: 13px;
						}
						
						.footer a {
							color: var(--highlight-color);
							text-decoration: none;
						}
						
						.footer a:hover {
							text-decoration: underline;
						}
					</style>
					<script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
				</head>
				<body>
					<div class="toolbar">
						<div class="toolbar-title">${FileName}</div>
						<div class="toolbar-actions">
							<button class="toggle-btn" onclick="toggleAllModules(true)">展开全部</button>
							<button class="toggle-btn" onclick="toggleAllModules(false)">折叠全部</button>
						</div>
					</div>
					
					<div class="container">
						<div class="header">
							<h1>${FileName} 订阅管理面板</h1>
							<p>节点聚合与订阅转换服务</p>
						</div>
						
						<div class="module active" id="module-editor">
							<div class="module-header" onclick="toggleModule('module-editor')">
								<h2>${FileName} 汇聚订阅编辑</h2>
								<div class="module-icon">↓</div>
							</div>
							<div class="module-content">
								<div class="editor-container">
									${hasKV ? `
									<textarea class="editor" 
										placeholder="${decodeURIComponent(atob('TElOSyVFNyVBNCVCQSVFNCVCRSU4QiVFRiVCQyU4OCVFNCVCOCU4MCVFOCVBMSU4QyVFNCVCOCU4MCVFNCVCOCVBQSVFOCU4QSU4MiVFNyU4MiVCOSVFOSU5MyVCRSVFNiU4RSVBNSVFNSU4RCVCMyVFNSU4RiVBRiVFRiVCQyU4OSVFRiVCQyU5QQp2bGVzcyUzQSUyRiUyRjI0NmFhNzk1LTA2MzctNGY0Yy04ZjY0LTJjOGZiMjRjMWJhZCU0MDEyNy4wLjAuMSUzQTEyMzQlM0ZlbmNyeXB0aW9uJTNEbm9uZSUyNnNlY3VyaXR5JTNEdGxzJTI2c25pJTNEVEcuQ01MaXVzc3NzLmxvc2V5b3VyaXAuY29tJTI2YWxsb3dJbnNlY3VyZSUzRDElMjZ0eXBlJTNEd3MlMjZob3N0JTNEVEcuQ01MaXVzc3NzLmxvc2V5b3VyaXAuY29tJTI2cGF0aCUzRCUyNTJGJTI1M0ZlZCUyNTNEMjU2MCUyM0NGbmF0CnRyb2phbiUzQSUyRiUyRmFhNmRkZDJmLWQxY2YtNGE1Mi1iYTFiLTI2NDBjNDFhNzg1NiU0MDIxOC4xOTAuMjMwLjIwNyUzQTQxMjg4JTNGc2VjdXJpdHklM0R0bHMlMjZzbmklM0RoazEyLmJpbGliaWxpLmNvbSUyNmFsbG93SW5zZWN1cmUlM0QxJTI2dHlwZSUzRHRjcCUyNmhlYWRlclR5cGUlM0Rub25lJTIzSEsKc3MlM0ElMkYlMkZZMmhoWTJoaE1qQXRhV1YwWmkxd2IyeDVNVE13TlRveVJYUlFjVzQyU0ZscVZVNWpTRzlvVEdaVmNFWlJkMjVtYWtORFVUVnRhREZ0U21SRlRVTkNkV04xVjFvNVVERjFaR3RTUzBodVZuaDFielUxYXpGTFdIb3lSbTgyYW5KbmRERTRWelkyYjNCMGVURmxOR0p0TVdwNlprTm1RbUklMjUzRCU0MDg0LjE5LjMxLjYzJTNBNTA4NDElMjNERQoKCiVFOCVBRSVBMiVFOSU5OCU4NSVFOSU5MyVCRSVFNiU4RSVBNSVFNyVBNCVCQSVFNCVCRSU4QiVFRiVCQyU4OCVFNCVCOCU4MCVFOCVBMSU4QyVFNCVCOCU4MCVFNiU5RCVBMSVFOCVBRSVBMiVFOSU5OCU4NSVFOSU5MyVCRSVFNiU4RSVBNSVFNSU4RCVCMyVFNSU4RiVBRiVFRiVCQyU4OSVFRiVCQyU5QQpodHRwcyUzQSUyRiUyRnN1Yi54Zi5mcmVlLmhyJTJGYXV0bw=='))}"
										id="content">${content}</textarea>
									<div class="save-container">
										<button class="save-btn" onclick="saveContent(this)">保存</button>
										<span class="save-status" id="saveStatus"></span>
									</div>
									` : '<p>请绑定 <strong>变量名称</strong> 为 <strong>KV</strong> 的KV命名空间</p>'}
								</div>
							</div>
						</div>
						
						<div class="module" id="module-subscriptions">
							<div class="module-header" onclick="toggleModule('module-subscriptions')">
								<h2>订阅链接</h2>
								<div class="module-icon">↓</div>
							</div>
							<div class="module-content">
								<p>点击链接自动<strong>复制订阅地址</strong>并<strong>生成二维码</strong></p>
								<div class="divider"></div>
								
								<div class="sub-list">
									<div class="sub-item">
										<div>自适应订阅地址:</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sub','qrcode_0')">https://${url.hostname}/${mytoken}</a>
										<div id="qrcode_0" class="qrcode-container"></div>
									</div>
									
									<div class="sub-item">
										<div>Base64订阅地址:</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?b64','qrcode_1')">https://${url.hostname}/${mytoken}?b64</a>
										<div id="qrcode_1" class="qrcode-container"></div>
									</div>
									
									<div class="sub-item">
										<div>Clash订阅地址:</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?clash','qrcode_2')">https://${url.hostname}/${mytoken}?clash</a>
										<div id="qrcode_2" class="qrcode-container"></div>
									</div>
									
									<div class="sub-item">
										<div>SingBox订阅地址:</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sb','qrcode_3')">https://${url.hostname}/${mytoken}?sb</a>
										<div id="qrcode_3" class="qrcode-container"></div>
									</div>
									
									<div class="sub-item">
										<div>Surge订阅地址:</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?surge','qrcode_4')">https://${url.hostname}/${mytoken}?surge</a>
										<div id="qrcode_4" class="qrcode-container"></div>
									</div>
									
									<div class="sub-item">
										<div>Loon订阅地址:</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?loon','qrcode_5')">https://${url.hostname}/${mytoken}?loon</a>
										<div id="qrcode_5" class="qrcode-container"></div>
									</div>
								</div>
							</div>
						</div>
						
						<div class="module" id="module-guest">
							<div class="module-header" onclick="toggleModule('module-guest')">
								<h2>访客订阅</h2>
								<div class="module-icon">↓</div>
							</div>
							<div class="module-content">
								<p>访客订阅只能使用订阅功能，无法查看配置页！</p>
								<div class="config-item">GUEST (访客订阅TOKEN): <strong>${guest}</strong></div>
								<div class="divider"></div>
								
								<div class="sub-list">
									<div class="sub-item">
										<div>自适应订阅地址:</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}','guest_0')">https://${url.hostname}/sub?token=${guest}</a>
										<div id="guest_0" class="qrcode-container"></div>
									</div>
									
									<div class="sub-item">
										<div>Base64订阅地址:</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&b64','guest_1')">https://${url.hostname}/sub?token=${guest}&b64</a>
										<div id="guest_1" class="qrcode-container"></div>
									</div>
									
									<div class="sub-item">
										<div>Clash订阅地址:</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&clash','guest_2')">https://${url.hostname}/sub?token=${guest}&clash</a>
										<div id="guest_2" class="qrcode-container"></div>
									</div>
									
									<div class="sub-item">
										<div>SingBox订阅地址:</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&sb','guest_3')">https://${url.hostname}/sub?token=${guest}&sb</a>
										<div id="guest_3" class="qrcode-container"></div>
									</div>
									
									<div class="sub-item">
										<div>Surge订阅地址:</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&surge','guest_4')">https://${url.hostname}/sub?token=${guest}&surge</a>
										<div id="guest_4" class="qrcode-container"></div>
									</div>
									
									<div class="sub-item">
										<div>Loon订阅地址:</div>
										<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&loon','guest_5')">https://${url.hostname}/sub?token=${guest}&loon</a>
										<div id="guest_5" class="qrcode-container"></div>
									</div>
								</div>
							</div>
						</div>
						
						<div class="module" id="module-config">
							<div class="module-header" onclick="toggleModule('module-config')">
								<h2>订阅转换配置</h2>
								<div class="module-icon">↓</div>
							</div>
							<div class="module-content">
								<div class="config-item">SUBAPI (订阅转换后端): <strong>${subProtocol}://${subConverter}</strong></div>
								<div class="config-item">SUBCONFIG (订阅转换配置文件): <strong>${subConfig}</strong></div>
							</div>
						</div>
						
						<div class="module" id="module-about">
							<div class="module-header" onclick="toggleModule('module-about')">
								<h2>关于</h2>
								<div class="module-icon">↓</div>
							</div>
							<div class="module-content">
								<p>六趣聚合订阅是一个汇集各种代理节点的聚合工具，为您提供高效便捷的网络访问服务。</p>
								<p>本项目基于<a href="https://github.com/cmliu/CF-Workers-SUB" target="_blank">CF-Workers-SUB</a>开发，感谢原作者的贡献。</p>
								<div class="divider"></div>
								<p>如需帮助，请访问我们的使用指南：<a href="https://example.com/guide" target="_blank">使用指南</a></p>
								<div class="divider"></div>
								<p>User Agent: <strong>${request.headers.get('User-Agent')}</strong></p>
							</div>
						</div>
						
						<div class="footer">
							<p>© ${new Date().getFullYear()} ${FileName} - 节点聚合与订阅转换服务</p>
						</div>
					</div>
					
					<script>
					function copyToClipboard(text, qrcode) {
						navigator.clipboard.writeText(text).then(() => {
							alert('已复制到剪贴板');
						}).catch(err => {
							console.error('复制失败:', err);
						});
						const qrcodeDiv = document.getElementById(qrcode);
						qrcodeDiv.innerHTML = '';
						new QRCode(qrcodeDiv, {
							text: text,
							width: 160,
							height: 160,
							colorDark: "#000000",
							colorLight: "#ffffff",
							correctLevel: QRCode.CorrectLevel.H,
							scale: 1
						});
					}
					
					function toggleModule(moduleId) {
						const module = document.getElementById(moduleId);
						module.classList.toggle('active');
					}
					
					function toggleAllModules(show) {
						const modules = document.querySelectorAll('.module');
						modules.forEach(module => {
							if (show) {
								module.classList.add('active');
							} else {
								module.classList.remove('active');
							}
						});
					}
						
					if (document.querySelector('.editor')) {
						let timer;
						const textarea = document.getElementById('content');
						const originalContent = textarea.value;
		
						function goBack() {
							const currentUrl = window.location.href;
							const parentUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
							window.location.href = parentUrl;
						}
		
						function replaceFullwidthColon() {
							const text = textarea.value;
							textarea.value = text.replace(/：/g, ':');
						}
						
						function saveContent(button) {
							try {
								const updateButtonText = (step) => {
									button.textContent = \`保存中: \${step}\`;
								};
								// 检测是否为iOS设备
								const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
								
								// 仅在非iOS设备上执行replaceFullwidthColon
								if (!isIOS) {
									replaceFullwidthColon();
								}
								updateButtonText('开始保存');
								button.disabled = true;

								// 获取textarea内容和原始内容
								const textarea = document.getElementById('content');
								if (!textarea) {
									throw new Error('找不到文本编辑区域');
								}

								updateButtonText('获取内容');
								let newContent;
								let originalContent;
								try {
									newContent = textarea.value || '';
									originalContent = textarea.defaultValue || '';
								} catch (e) {
									console.error('获取内容错误:', e);
									throw new Error('无法获取编辑内容');
								}

								updateButtonText('准备状态更新函数');
								const updateStatus = (message, isError = false) => {
									const statusElem = document.getElementById('saveStatus');
									if (statusElem) {
										statusElem.textContent = message;
										statusElem.style.color = isError ? 'red' : '#666';
									}
								};

								updateButtonText('准备按钮重置函数');
								const resetButton = () => {
									button.textContent = '保存';
									button.disabled = false;
								};

								if (newContent !== originalContent) {
									updateButtonText('发送保存请求');
									fetch(window.location.href, {
										method: 'POST',
										body: newContent,
										headers: {
											'Content-Type': 'text/plain;charset=UTF-8'
										},
										cache: 'no-cache'
									})
									.then(response => {
										updateButtonText('检查响应状态');
										if (!response.ok) {
											throw new Error(\`HTTP error! status: \${response.status}\`);
										}
										updateButtonText('更新保存状态');
										const now = new Date().toLocaleString();
										document.title = \`编辑已保存 \${now}\`;
										updateStatus(\`已保存 \${now}\`);
									})
									.catch(error => {
										updateButtonText('处理错误');
										console.error('Save error:', error);
										updateStatus(\`保存失败: \${error.message}\`, true);
									})
									.finally(() => {
										resetButton();
									});
								} else {
									updateButtonText('检查内容变化');
									updateStatus('内容未变化');
									resetButton();
								}
							} catch (error) {
								console.error('保存过程出错:', error);
								button.textContent = '保存';
								button.disabled = false;
								const statusElem = document.getElementById('saveStatus');
								if (statusElem) {
									statusElem.textContent = \`错误: \${error.message}\`;
									statusElem.style.color = 'red';
								}
							}
						}
		
						textarea.addEventListener('blur', saveContent);
						textarea.addEventListener('input', () => {
							clearTimeout(timer);
							timer = setTimeout(saveContent, 5000);
						});
					}
					
					// 初始化设置，只保持第一个模块展开
					document.addEventListener('DOMContentLoaded', () => {
						const modules = document.querySelectorAll('.module');
						modules.forEach((module, index) => {
							if (index === 0) {
								module.classList.add('active');
							} else {
								module.classList.remove('active');
							}
						});
					});
					</script>
				</body>
			</html>
		`;

		return new Response(html, {
			headers: { "Content-Type": "text/html;charset=utf-8" }
		});
	} catch (error) {
		console.error('处理请求时发生错误:', error);
		return new Response("服务器错误: " + error.message, {
			status: 500,
			headers: { "Content-Type": "text/plain;charset=utf-8" }
		});
	}
}
