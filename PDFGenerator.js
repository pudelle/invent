import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import font from "./fonts/Roboto-Regular-normal.js"; // Подключён как VFS

const PDFGenerator = (cartItems, userName, projectName, deliveryDate, returnDate) => {
  try {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      alert("Корзина пуста или данные некорректны");
      return;
    }

    const doc = new jsPDF();

    // 🔥 Регистрация шрифта
    doc.addFileToVFS("Roboto-Regular.ttf", font); // Загружаем шрифт
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal"); // Регистрируем шрифт
    doc.setFont("Roboto", "normal"); // Устанавливаем шрифт по умолчанию

    // 🔥 Заголовок
    doc.setFontSize(16);
    const title = "Позиции на отгрузку";
    console.log("Заголовок:", title); // Логируем текст
    doc.text(title, 14, 20);

    // 🔥 Таблица
    const headers = [["ID", "Название", "Кол-во"]];
    const data = cartItems.map((item) => [
      String(item.id ?? ""),
      String(item.name ?? ""),
      String(item.quantity ?? ""),
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 30,
      headStyles: {
        fillColor: [78, 92, 128], // RGB-цвет для фона (например, синий)
        textColor: [255, 255, 255], // RGB-цвет для текста (например, белый)
        fontStyle: "bold", // Стиль текста (например, жирный)
      },
      styles: { font: "Roboto" }, // Указываем шрифт для таблицы
    });

    // 🔥 Дополнительная информация
    const endY = doc.autoTable.previous.finalY || 40;

    const footerData = [
      `Заказал: ${userName || "-"}`,
      `Проект: ${projectName || "-"}`,
      `Срок: ${deliveryDate || "-"} — ${returnDate || "-"}`,
    ];

    doc.setFontSize(12);
    footerData.forEach((line, index) => {
      console.log(`Текст внизу страницы (${index + 1}):`, line); // Логируем текст
      doc.text(line, 14, endY + 10 + index * 10);
    });

    // 🔥 Сохранение PDF
    doc.save("order.pdf");
  } catch (error) {
    console.error("❌ Ошибка генерации PDF:", error);
    alert("Ошибка: не удалось сгенерировать PDF");
  }
  
};

export default PDFGenerator;