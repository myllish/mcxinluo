// ========= 服务器信息（Java版 + 基岩版） =========
const javaHost = "xinluo.vemc.cc";          // Java版地址（默认端口25565）
const bedrockHost = "xtdmc.top";            // 基岩版主机
const bedrockPort = "29201";                // 基岩版端口

// ========= 1. Hero区域生成粒子、光晕、视差背景DOM =========
const heroDom = document.querySelector(".hero");
// 视差背景层
const parallaxLayer = document.createElement("div");
parallaxLayer.className = "hero-parallax-bg";
heroDom.prepend(parallaxLayer);
// 渐变遮罩
const maskLayer = document.createElement("div");
maskLayer.className = "hero-mask";
heroDom.insertBefore(maskLayer, parallaxLayer.nextSibling);
// 粒子容器
const particleBox = document.createElement("div");
particleBox.className = "hero-particles";
heroDom.insertBefore(particleBox, maskLayer.nextSibling);
// 生成75颗随机星星粒子
for(let i=0;i<75;i++){
    const star = document.createElement("div");
    star.classList.add("star-particle");
    const size = Math.random() * 2.8 + 1;
    star.style.width = size + "px";
    star.style.height = size + "px";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.animationDelay = Math.random() * 12 + "s";
    star.style.animationDuration = (10 + Math.random() * 10) + "s";
    particleBox.appendChild(star);
}
// 生成双层氛围光晕
const glow1 = document.createElement("div");
const glow2 = document.createElement("div");
glow1.className = "hero-glow-1";
glow2.className = "hero-glow-2";
heroDom.appendChild(glow1);
heroDom.appendChild(glow2);

// ========= 2. Hero视差滚动逻辑（requestAnimationFrame性能优化） =========
let ticking = false;
function updateParallax(){
    const scrollY = window.pageYOffset;
    parallaxLayer.style.transform = `translateY(${scrollY * 0.3}px)`;
    ticking = false;
}
window.addEventListener("scroll",()=>{
    if(!ticking){
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
})

// ========= 3. IP复制功能（支持Java/基岩双地址） =========
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const ip = btn.getAttribute('data-ip');
        try {
            await navigator.clipboard.writeText(ip);
            alert('服务器地址复制成功！' + ip);
        } catch (err) {
            // 兼容不支持Clipboard API的浏览器，回退到提示手动复制
            alert('复制失败，请手动复制：' + ip);
        }
    });
});

// ========= 4. 页面滚动元素丝滑渐入动画 =========
const fadeElements = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
entries.forEach(item => {
    if(item.isIntersecting){
        item.target.classList.add('active');
        // 加载完成后停止观察，提升性能
        observer.unobserve(item.target);
    }
})
}, {threshold: 0.12});
fadeElements.forEach(el => observer.observe(el));

// ========= 5. MCSrvStat 查服接口 - 实时获取两个服务器在线状态 =========
function setStatus(el, text, className){
    if(el){ el.innerText = text; if(className) el.className = "stat-num " + className; }
}
// 查询单个服务器状态
async function getServerStatus(host, port, ids) {
    const key = port ? `${host}:${port}` : host;
    const url = `https://api.mcsrvstat.us/2/${key}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.online) {
            setStatus(document.getElementById(ids.status), "✅ 在线", "server-status-online");
            if(document.getElementById(ids.online)){
                document.getElementById(ids.online).innerText = (data.players && data.players.online) ? data.players.online : "0";
            }
        } else {
            setStatus(document.getElementById(ids.status), "❌ 离线", "server-status-offline");
            if(document.getElementById(ids.online)) document.getElementById(ids.online).innerText = "0";
        }
    } catch (error) {
        setStatus(document.getElementById(ids.status), "⌛ 加载失败", null);
        if(document.getElementById(ids.online)) document.getElementById(ids.online).innerText = "--";
        console.error("服务器接口请求异常：", error);
    }
}
// 页面加载完成自动查询两个服务器状态
window.addEventListener('DOMContentLoaded', () => {
    getServerStatus(javaHost, null, {
        status: "java-status-text",
        online: "java-online"
    });
    getServerStatus(bedrockHost, bedrockPort, {
        status: "bedrock-status-text",
        online: "bedrock-online"
    });
});
// 每5分钟自动刷新一次在线数据
setInterval(() => {
    getServerStatus(javaHost, null, {
        status: "java-status-text",
        online: "java-online"
    });
    getServerStatus(bedrockHost, bedrockPort, {
        status: "bedrock-status-text",
        online: "bedrock-online"
    });
}, 300000);
