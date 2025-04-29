document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const generatePdfButton = document.getElementById('generate-pdf');

    if (!cartItemsContainer) {
        console.error("Элемент с id='cart-items' не найден!");
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!Array.isArray(cart)) {
        console.error('Данные корзины повреждены. Сбрасываем корзину.');
        cart = [];
    }

    console.log("Данные корзины:", cart);

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Корзина пуста</p>';
        return;
    }

    cart.forEach(item => {
        console.log("Рендеринг товара:", item);
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image || '/static/default-thumbnail.png'}"
                 alt="${item.name || 'Без названия'}"
                 class="cart-item-image">
            <div class="item-details">
                <h3>${item.name || 'Без названия'}</h3>
                <p>ID: ${item.id}</p>
                <div class="quantity-controls">
                    <button data-id="${item.id}" class="decrease">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button data-id="${item.id}" class="increase">+</button>
                </div>
                <button data-id="${item.id}" class="remove-item">Удалить</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    document.querySelectorAll('.increase').forEach(btn =>
        btn.addEventListener('click', e => updateQuantity(e.target.dataset.id, 1))
    );
    document.querySelectorAll('.decrease').forEach(btn =>
        btn.addEventListener('click', e => updateQuantity(e.target.dataset.id, -1))
    );
    document.querySelectorAll('.remove-item').forEach(btn =>
        btn.addEventListener('click', e => removeFromCart(e.target.dataset.id))
    );

    if (generatePdfButton) {
        generatePdfButton.addEventListener('click', () => {
            console.log("Кнопка 'Сгенерировать PDF' нажата");
            const projectName  = document.getElementById("project-name").value;
            const deliveryDate = document.getElementById("delivery-date").value;
            const returnDate   = document.getElementById("return-date").value;

            // Вся основная логика перенесена внутрь PDFGenerator
            PDFGenerator(cart, projectName, deliveryDate, returnDate);
        });
    } else {
        console.error("Кнопка для генерации PDF не найдена!");
    }
});

function updateQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const idx = cart.findIndex(item => item.id === productId);
    if (idx !== -1) {
        cart[idx].quantity += change;
        if (cart[idx].quantity <= 0) cart.splice(idx, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        location.reload();
    } else {
        console.error(`Товар с ID ${productId} не найден.`);
    }
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    location.reload();
}

function PDFGenerator(cartItems, projectName, deliveryDate, returnDate) {
    try {
        // 1) Проверяем входные данные
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            alert("Корзина пуста или данные некорректны");
            return;
        }

        // 2) Создаём документ
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // 3) Заголовок
        doc.setFontSize(16);
        const title = "Позиции на отгрузку";
        doc.text(title, 14, 20);

        // 4) Подготавливаем данные таблицы
        const headers = [["ID", "Название", "Кол-во"]];
        const data = cartItems.map(item => [
            String(item.id   ?? ""),
            String(item.name ?? ""),
            String(item.quantity ?? "")
        ]);

        // 5) Рисуем таблицу с дизайном из вашего примера
        const table = doc.autoTable({
            head: headers,
            body: data,
            startY: 30,
            headStyles: {
                fillColor: [78, 92, 128],
                textColor: [255, 255, 255],
                fontStyle: "bold"
            },
            styles: {
                fontSize: 10
            }
        });

        // 6) Считаем, где кончается таблица
        const endY = table.finalY || 40;

        // 7) Формируем и выводим дополнительную информацию
        const footerData = [
            `Проект: ${projectName  ?? "-"}`,
            `Срок:  ${(deliveryDate ?? "-")} — ${(returnDate  ?? "-")}`
        ];

        doc.setFontSize(12);
        footerData.forEach((line, i) =>
            doc.text(line, 14, endY + 10 + i * 10)
        );

        // 8) Сохраняем PDF
        doc.save("order.pdf");
        console.log("PDF сгенерирован и сохранён");
    } catch (error) {
        console.error("❌ Ошибка генерации PDF:", error);
        alert("Ошибка: не удалось сгенерировать PDF");
    }
}
