const summary = [
  ["Produtos ativos", PRODUCTS.filter((product) => product.inStock).length],
  ["Categorias", new Set(PRODUCTS.map((product) => product.category)).size],
  ["Ofertas", PRODUCTS.filter((product) => product.oldPrice).length],
  ["Pedidos pelo WhatsApp", "Ativo"]
];

document.getElementById("summaryGrid").innerHTML = summary.map(([label, value]) => `
  <article class="summary-card">
    <span>${label}</span>
    <strong>${value}</strong>
  </article>
`).join("");

document.getElementById("productRows").innerHTML = PRODUCTS.map((product) => `
  <tr>
    <td><strong>${product.name}</strong><br><small>${product.unit}</small></td>
    <td>
      <select aria-label="Categoria de ${product.name}">
        ${CATEGORIES.filter((category) => category !== "Todos" && category !== "Ofertas" && category !== "Mais Vendidos").map((category) => `<option ${category === product.category ? "selected" : ""}>${category}</option>`).join("")}
      </select>
    </td>
    <td><input aria-label="Preco de ${product.name}" value="${product.price.toFixed(2)}"></td>
    <td><button class="small-button" type="button">${product.inStock ? "Indisponibilizar" : "Disponibilizar"}</button></td>
    <td><label><input type="checkbox" ${product.featured ? "checked" : ""}> Destaque/oferta</label></td>
    <td><button class="small-button" type="button">Editar preview</button> <button class="small-button" type="button">Salvar futuro</button></td>
  </tr>
`).join("");

document.getElementById("addProduct").addEventListener("click", () => {
  alert("Preview: na versao com backend, este botao abrira o formulario para adicionar produto, imagem, preco, categoria e disponibilidade.");
});
