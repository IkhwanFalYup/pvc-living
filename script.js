const SETTINGS = {
    whatsapp: "628xxxxxxxxxx",
    email: "email@tokopvc.com",
    address: "Jl. Contoh No. 10, Jakarta, Indonesia",
    googleMaps: "https://www.google.com/maps?q=Jakarta%20Indonesia&output=embed"
};

const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? `${window.location.origin}/pvc-living/api/`
    : `${window.location.origin}/api/`;

const DEFAULT_IMAGE = "assets/images/default.svg";
let allProducts = [];
let currentProduct = null;
let quantity = 1;

document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initFooter();
    applySettings();
    const page = document.body.dataset.page;
    if (page === "home") loadHomeProducts();
    if (page === "products") initProductsPage();
    if (page === "portfolio") loadPortfolios();
    if (page === "admin") initAdmin();
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeAllModals(); });
});

function initHeader(){
    const header = document.getElementById("siteHeader");
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".main-nav");
    window.addEventListener("scroll", () => header?.classList.toggle("scrolled", window.scrollY > 8));
    toggle?.addEventListener("click", () => nav?.classList.toggle("open"));
    document.querySelectorAll(".main-nav a").forEach(a => {
        if (a.getAttribute("href") === location.pathname.split("/").pop() || (a.getAttribute("href")==="index.html" && !location.pathname.endsWith(".html"))) a.classList.add("active");
    });
}

function initFooter(){
    const footer = document.querySelector(".site-footer");
    if (!footer) return;
    footer.innerHTML = `<div class="container">
      <div class="footer-grid">
        <div><div class="footer-brand">PVC & Alum by Sumber Kenari Jaya</div><p class="footer-desc">Panel PVC, plafon PVC, dan aluminium untuk kebutuhan interior rumah, kantor, toko, dan ruang lainnya.</p>
        <div>Instagram · Facebook · YouTube</div></div>
        <div class="footer-col"><h4>Navigasi</h4><a href="index.html">Beranda</a><a href="produk.html">Produk</a><a href="portofolio.html">Portofolio</a><a href="tentang.html">Tentang</a><a href="kontak.html">Kontak</a></div>
        <div class="footer-col"><h4>Kontak</h4><a data-wa-link href="#">WhatsApp</a><a data-email-link href="#">${escapeHtml(SETTINGS.email)}</a><a href="kontak.html">${escapeHtml(SETTINGS.address)}</a></div>
      </div>
      <div class="footer-bottom"><span>© 2026 PVC & Alum by Sumber Kenari Jaya. All Rights Reserved.</span><span>Designed with care.</span></div>
    </div>`;
}

function applySettings(){
    document.querySelectorAll("[data-wa-link]").forEach(el => el.href = `https://wa.me/${SETTINGS.whatsapp}?text=${encodeURIComponent("Halo, saya ingin konsultasi mengenai produk PVC & Aluminium.")}`);
    document.querySelectorAll("[data-email-link]").forEach(el => el.href = `mailto:${SETTINGS.email}`);
    const email = document.getElementById("contactEmail"), emailLink = document.getElementById("emailLink");
    const addr = document.getElementById("contactAddress"), wa = document.getElementById("contactWhatsapp"), map = document.getElementById("mapFrame");
    if(email) email.textContent = SETTINGS.email;
    if(emailLink) emailLink.href = `mailto:${SETTINGS.email}`;
    if(addr) addr.textContent = SETTINGS.address;
    if(wa) wa.textContent = displayPhone(SETTINGS.whatsapp);
    if(map) map.src = SETTINGS.googleMaps;
}

async function apiFetch(endpoint, options = {}){
    const res = await fetch(API_URL + endpoint, options);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { throw new Error("Respons API tidak valid. Pastikan PHP berjalan di XAMPP."); }
    if (!res.ok) throw new Error(data.message || "Terjadi kesalahan.");
    return data;
}

async function getProducts(){
    const data = await apiFetch("get_products.php");
    allProducts = Array.isArray(data) ? data : [];
    return allProducts;
}
async function loadHomeProducts(){
    const grid = document.getElementById("homeProducts");
    try {
        const products = await getProducts();
        grid.innerHTML = products.slice(0,4).map(productCard).join("");
    } catch(e) { grid.innerHTML = `<div class="empty-state">${escapeHtml(e.message)}</div>`; }
}
async function initProductsPage(){
    const grid = document.getElementById("productGrid");
    try {
        await getProducts(); renderProducts();
        ["productSearch","categoryFilter","sortFilter"].forEach(id => document.getElementById(id)?.addEventListener("input", renderProducts));
    } catch(e) { grid.innerHTML = `<div class="empty-state">${escapeHtml(e.message)}</div>`; }
}
function renderProducts(){
    const q = (document.getElementById("productSearch")?.value || "").toLowerCase().trim();
    const cat = document.getElementById("categoryFilter")?.value || "";
    const sort = document.getElementById("sortFilter")?.value || "newest";
    let products = allProducts.filter(p => `${p.name} ${p.code} ${p.description}`.toLowerCase().includes(q) && (!cat || p.category === cat));
    products.sort((a,b) => sort==="price-low" ? +a.price-+b.price : sort==="price-high" ? +b.price-+a.price : sort==="name" ? a.name.localeCompare(b.name) : +b.id-+a.id);
    document.getElementById("productGrid").innerHTML = products.map(productCard).join("");
    document.getElementById("emptyProducts")?.classList.toggle("hidden", products.length > 0);
}
function productCard(p){
    const stock = Number(p.stock);
    return `<article class="product-card">
      <img class="product-image" src="${safeImage(p.image)}" onerror="this.src='${DEFAULT_IMAGE}'" alt="${escapeAttr(p.name)}">
      <div class="product-content"><span class="product-code">${escapeHtml(p.code)}</span><h3>${escapeHtml(p.name)}</h3>
      <span class="stock-badge ${stock<=0?'empty':''}">${stock>0?'Stok Tersedia':'Stok Habis'}</span>
      <div class="price">${formatRupiah(p.price)}</div><p class="product-desc">${escapeHtml(p.description || "Produk berkualitas untuk kebutuhan interior.")}</p>
      <button class="btn btn-primary" ${stock<=0?'disabled':''} onclick="openProductModal(${Number(p.id)})">${stock>0?'Pesan via WhatsApp':'Stok Habis'}</button></div>
    </article>`;
}
function openProductModal(id){
    currentProduct = allProducts.find(p => Number(p.id) === Number(id));
    if (!currentProduct) return;
    quantity = 1;
    const modal = document.getElementById("productModal");
    modal.innerHTML = `<div class="modal-card"><button class="modal-close" onclick="closeProductModal()">×</button>
      <div class="modal-product"><img src="${safeImage(currentProduct.image)}" onerror="this.src='${DEFAULT_IMAGE}'" alt="${escapeAttr(currentProduct.name)}">
      <div><span class="eyebrow">${escapeHtml(currentProduct.category)}</span><h2>${escapeHtml(currentProduct.name)}</h2><p class="product-code">${escapeHtml(currentProduct.code)}</p><div class="price">${formatRupiah(currentProduct.price)}</div><p>${escapeHtml(currentProduct.description || "")}</p><p><strong>Stok:</strong> ${Number(currentProduct.stock)}</p>
      <div class="qty-control"><button onclick="changeQty(-1)">−</button><strong id="qtyValue">1</strong><button onclick="changeQty(1)">+</button></div>
      <button class="btn btn-primary full" onclick="orderCurrentProduct()">Pesan via WhatsApp</button></div></div></div>`;
    modal.classList.add("open");
    modal.onclick = e => { if(e.target === modal) closeProductModal(); };
}
function changeQty(delta){
    if (!currentProduct) return;
    quantity = Math.max(1, Math.min(Number(currentProduct.stock), quantity + delta));
    document.getElementById("qtyValue").textContent = quantity;
}
function orderCurrentProduct(){
    if (!currentProduct || Number(currentProduct.stock) <= 0) return;
    const msg = `Halo, saya ingin membeli:
Nama Produk: ${currentProduct.name}
Kode: ${currentProduct.code}
Harga: ${formatRupiah(currentProduct.price)}
Jumlah: ${quantity}
Apakah produk tersebut masih tersedia?`;
    window.open(`https://wa.me/${SETTINGS.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
}
function closeProductModal(){ document.getElementById("productModal")?.classList.remove("open"); }
function closeAllModals(){ document.querySelectorAll(".modal").forEach(m => m.classList.remove("open")); }

async function loadPortfolios(){
    const grid = document.getElementById("portfolioGrid");
    try {
        const data = await apiFetch("get_portfolios.php");
        grid.innerHTML = data.map(p => `<article class="portfolio-card"><img src="${safeImage(p.image)}" onerror="this.src='${DEFAULT_IMAGE}'" alt="${escapeAttr(p.title)}"><div><small>${escapeHtml(p.category || "Project")}</small><h3>${escapeHtml(p.title)}</h3></div></article>`).join("");
    } catch(e) { grid.innerHTML = `<div class="empty-state">${escapeHtml(e.message)}</div>`; }
}

function getToken(){ return sessionStorage.getItem("pvc_admin_token") || ""; }
function authOptions(method="GET", body=null){
    const opt = {method, headers: {"Authorization": `Bearer ${getToken()}`, "Content-Type":"application/json"}};
    if(body !== null) opt.body = JSON.stringify(body);
    return opt;
}
async function initAdmin(){
    const logged = !!getToken();
    showAdminState(logged);
    if(logged) await refreshAdmin();
    document.getElementById("loginForm")?.addEventListener("submit", adminLogin);
    document.getElementById("logoutBtn")?.addEventListener("click", logoutAdmin);
    document.getElementById("addProductBtn")?.addEventListener("click", () => openAdminProduct());
    document.getElementById("addPortfolioBtn")?.addEventListener("click", () => openAdminPortfolio());
    document.querySelectorAll("[data-close-admin]").forEach(b => b.addEventListener("click", closeAllModals));
    document.getElementById("productForm")?.addEventListener("submit", saveProduct);
    document.getElementById("portfolioForm")?.addEventListener("submit", savePortfolio);
}
async function adminLogin(e){
    e.preventDefault();
    const error = document.getElementById("loginError");
    error.textContent = "";
    try{
        const data = await apiFetch("login.php", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:document.getElementById("loginUsername").value.trim(),password:document.getElementById("loginPassword").value})});
        sessionStorage.setItem("pvc_admin_token", data.token);
        showAdminState(true); await refreshAdmin(); toast("Login berhasil.");
    }catch(err){ error.textContent = err.message; }
}
function showAdminState(logged){
    document.getElementById("loginPanel")?.classList.toggle("hidden", logged);
    document.getElementById("dashboardPanel")?.classList.toggle("hidden", !logged);
}
function logoutAdmin(){ sessionStorage.removeItem("pvc_admin_token"); showAdminState(false); toast("Anda telah logout."); }
async function refreshAdmin(){
    try{
        const products = await apiFetch("get_products.php", authOptions());
        allProducts = Array.isArray(products) ? products : [];
        renderAdminProducts();
        document.getElementById("statProducts").textContent = allProducts.length;
        document.getElementById("statStock").textContent = allProducts.reduce((s,p)=>s+Number(p.stock),0);
        document.getElementById("statEmpty").textContent = allProducts.filter(p=>Number(p.stock)===0).length;
        const portfolios = await apiFetch("get_portfolios.php", authOptions());
        document.getElementById("adminPortfolios").innerHTML = portfolios.map(p => `<tr><td><img src="${safeImage(p.image)}" onerror="this.src='${DEFAULT_IMAGE}'"></td><td>${escapeHtml(p.title)}</td><td>${escapeHtml(p.category||"-")}</td><td><div class="action-row"><button class="btn-small" onclick="deletePortfolio(${Number(p.id)})">Hapus</button></div></td></tr>`).join("");
    }catch(e){
        if(e.message.toLowerCase().includes("token")) logoutAdmin();
        else toast(e.message,true);
    }
}
function renderAdminProducts(){
    document.getElementById("adminProducts").innerHTML = allProducts.map(p => `<tr>
    <td><img src="${safeImage(p.image)}" onerror="this.src='${DEFAULT_IMAGE}'"></td><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.code)}</td><td>${formatRupiah(p.price)}</td><td><strong>${Number(p.stock)}</strong></td>
    <td class="${Number(p.stock)>0?'status-ok':'status-empty'}">${Number(p.stock)>0?'TERSEDIA':'STOK HABIS'}</td>
    <td><div class="action-row"><button class="btn-small" onclick="openAdminProduct(${Number(p.id)})">Edit</button><button class="btn-small" onclick="changeStock(${Number(p.id)},10)">+10</button><button class="btn-small" onclick="changeStock(${Number(p.id)},-5)">-5</button><button class="btn-small" onclick="manualStock(${Number(p.id)})">Stok</button><button class="btn-small" onclick="deleteProduct(${Number(p.id)})">Hapus</button></div></td>
    </tr>`).join("");
}
function openAdminProduct(id=null){
    const p = id ? allProducts.find(x=>Number(x.id)===Number(id)) : null;
    document.getElementById("productFormTitle").textContent = p ? "Edit Produk" : "Tambah Produk";
    document.getElementById("productId").value = p?.id || "";
    document.getElementById("productName").value = p?.name || "";
    document.getElementById("productCode").value = p?.code || "";
    document.getElementById("productPrice").value = p?.price || "";
    document.getElementById("productStock").value = p?.stock ?? 0;
    document.getElementById("productCategory").value = p?.category || "Panel PVC";
    document.getElementById("productImage").value = p?.image || DEFAULT_IMAGE;
    document.getElementById("productDescription").value = p?.description || "";
    document.getElementById("adminProductModal").classList.add("open");
}
async function saveProduct(e){
    e.preventDefault();
    const id = document.getElementById("productId").value;
    const body = {id:id?Number(id):undefined,name:document.getElementById("productName").value.trim(),code:document.getElementById("productCode").value.trim(),price:Number(document.getElementById("productPrice").value),stock:Number(document.getElementById("productStock").value),category:document.getElementById("productCategory").value,image:document.getElementById("productImage").value.trim(),description:document.getElementById("productDescription").value.trim()};
    try{ await apiFetch(id?"edit_product.php":"add_product.php",authOptions(id?"PUT":"POST",body)); closeAllModals(); toast(id?"Produk diperbarui.":"Produk ditambahkan."); await refreshAdmin(); }
    catch(err){ toast(err.message,true); }
}
async function changeStock(id,delta){
    const p=allProducts.find(x=>Number(x.id)===Number(id)); if(!p) return;
    const newStock=Math.max(0,Number(p.stock)+delta);
    await updateStock(p,newStock);
}
async function manualStock(id){
    const p=allProducts.find(x=>Number(x.id)===Number(id)); if(!p) return;
    const value=prompt(`Masukkan stok baru untuk ${p.name}:`,p.stock);
    if(value===null) return;
    if(!/^\d+$/.test(value)) return toast("Stok harus berupa angka 0 atau lebih.",true);
    await updateStock(p,Number(value));
}
async function updateStock(p,newStock){
    try{await apiFetch("edit_product.php",authOptions("PUT",{...p,id:Number(p.id),stock:newStock}));toast("Stok diperbarui.");await refreshAdmin();}catch(e){toast(e.message,true);}
}
async function deleteProduct(id){
    if(!confirm("Yakin ingin menghapus produk ini?")) return;
    try{await apiFetch("delete_product.php",authOptions("DELETE",{id:Number(id)}));toast("Produk dihapus.");await refreshAdmin();}catch(e){toast(e.message,true);}
}
function openAdminPortfolio(){
    document.getElementById("portfolioForm").reset();
    document.getElementById("portfolioImage").value = DEFAULT_IMAGE;
    document.getElementById("adminPortfolioModal").classList.add("open");
}
async function savePortfolio(e){
    e.preventDefault();
    try{await apiFetch("add_portfolio.php",authOptions("POST",{title:document.getElementById("portfolioTitle").value.trim(),category:document.getElementById("portfolioCategory").value.trim(),image:document.getElementById("portfolioImage").value.trim()}));closeAllModals();toast("Portofolio ditambahkan.");await refreshAdmin();}catch(err){toast(err.message,true);}
}
async function deletePortfolio(id){
    if(!confirm("Yakin ingin menghapus portofolio ini?")) return;
    try{await apiFetch("delete_portfolio.php",authOptions("DELETE",{id:Number(id)}));toast("Portofolio dihapus.");await refreshAdmin();}catch(e){toast(e.message,true);}
}
function formatRupiah(value){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(value)||0);}
function safeImage(url){const s=String(url||"").trim();return s || DEFAULT_IMAGE;}
function displayPhone(v){const s=String(v);return s.startsWith("62")?"0"+s.slice(2):s;}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function escapeAttr(v){return escapeHtml(v);}
function toast(message,error=false){const t=document.getElementById("toast");if(!t)return;t.textContent=message;t.className=`toast show${error?" error":""}`;clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),3000);}
