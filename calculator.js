const percentFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
const moneyFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });
const detailFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });

const makeInitialState = () => ({
  fees: {
    commission: 0.13,
    transaction: 0.06,
    affiliate: 0,
    handling: 3000,
    operations: 5000,
    vat: 0.01,
    personalTax: 0.005,
    returnShipping: 1620
  },
  baseCost: 28000,
  products: [
    { quantity: 1, ads: 0, salePrice: 60000 },
    { quantity: 2, ads: 15000, salePrice: 49000 },
    { quantity: 3, ads: 15000, salePrice: 76000 },
    { quantity: 4, ads: 15000, salePrice: 99000 },
    { quantity: 5, ads: 15000, salePrice: 118000 }
  ],
  shipping: {
    length: 1,
    width: 5,
    height: 5,
    weight: 0.275,
    quantity: 20,
    itemPrice: 10.25,
    domesticFee: 7.8,
    exchangeRate: 4000,
    tiers: [
      { threshold: 0.3, rate: 7.3 },
      { threshold: 10, rate: 7.6 },
      { threshold: 50, rate: 6.6 },
      { threshold: 200, rate: 6.4 }
    ]
  }
});

let state = makeInitialState();
let nextFieldId = 0;

const settingFields = [
  { key: 'commission', label: 'Hoa hồng TikTok', unit: '%', percent: true },
  { key: 'transaction', label: 'Phí giao dịch', unit: '%', percent: true },
  { key: 'affiliate', label: 'Hoa hồng Affiliate', unit: '%', percent: true },
  { key: 'handling', label: 'Phí xử lý đơn', unit: 'đ' },
  { key: 'operations', label: 'Phí vận hành', unit: 'đ' },
  { key: 'vat', label: 'Thuế GTGT', unit: '%', percent: true },
  { key: 'personalTax', label: 'Thuế TNCN', unit: '%', percent: true },
  { key: 'returnShipping', label: 'Phí hoàn vận chuyển', unit: 'đ' }
];

const shippingFields = [
  { key: 'length', label: 'Dài', unit: 'cm' },
  { key: 'width', label: 'Rộng', unit: 'cm' },
  { key: 'height', label: 'Cao', unit: 'cm' },
  { key: 'weight', label: 'Trọng lượng mỗi sản phẩm', unit: 'kg' },
  { key: 'quantity', label: 'Số lượng', unit: 'sản phẩm', step: '1' },
  { key: 'itemPrice', label: 'Giá sàn (1 sản phẩm)', unit: '¥' },
  { key: 'domesticFee', label: 'Phí nội địa', unit: '¥' },
  { key: 'exchangeRate', label: 'Tỷ giá', unit: 'đ / ¥', step: '1' }
];

function numberInput({ label, value, unit, step = 'any', attributes = '' }) {
  const id = `input-${++nextFieldId}`;
  return `<label class="field" for="${id}">
    <span class="field-label">${label}</span>
    <span class="input-wrap">
      <input id="${id}" type="number" min="0" step="${step}" value="${value}" ${attributes}>
      <span class="unit">${unit}</span>
    </span>
  </label>`;
}

function renderInputs() {
  document.querySelector('#settings').innerHTML = settingFields.map(({ key, label, unit, percent }) => {
    const value = state.fees[key] * (percent ? 100 : 1);
    return numberInput({
      label,
      value,
      unit,
      attributes: `data-setting="${key}" aria-label="${label}"`
    });
  }).join('');

  document.querySelector('#products').innerHTML = state.products.map((product, index) => {
    const cost = index === 0
      ? `<input class="table-input" type="number" min="0" step="any" value="${state.baseCost}" data-base-cost aria-label="Giá nhập combo 1">`
      : `<span class="calculated-value" data-cost="${index}"></span>`;
    return `<tr>
      <th scope="row">Combo × ${product.quantity}</th>
      <td><input class="table-input" type="number" min="0" step="any" value="${product.ads}" data-product="${index}" data-field="ads" aria-label="Quảng cáo combo ${product.quantity}"></td>
      <td>${cost}</td>
      <td class="result-cell" data-break-even="${index}"></td>
      <td><input class="table-input" type="number" min="0" step="any" value="${product.salePrice}" data-product="${index}" data-field="salePrice" aria-label="Giá bán combo ${product.quantity}"></td>
      <td class="result-cell" data-profit="${index}"></td>
      <td class="result-cell" data-margin="${index}"></td>
    </tr>`;
  }).join('');

  document.querySelector('#shippingInputs').innerHTML = shippingFields.map(({ key, label, unit, step }) => (
    numberInput({
      label,
      value: state.shipping[key],
      unit,
      step: step || 'any',
      attributes: `data-shipping="${key}" aria-label="${label}"`
    })
  )).join('');

  document.querySelector('#shippingTiers').innerHTML = state.shipping.tiers.map((tier, index) => `<tr>
    <td><input class="table-input" type="number" min="0" step="any" value="${tier.threshold}" data-tier="${index}" data-field="threshold" aria-label="Mốc cân bậc ${index + 1}"></td>
    <td><input class="table-input" type="number" min="0" step="any" value="${tier.rate}" data-tier="${index}" data-field="rate" aria-label="Phí theo kg bậc ${index + 1}"></td>
  </tr>`).join('');
}

function readInputValue(input) {
  const value = input.value === '' ? 0 : Number(input.value);
  return Number.isFinite(value) ? value : 0;
}

function formatMoney(value) {
  return Number.isFinite(value) ? moneyFormatter.format(value) : '—';
}

function updatePricing() {
  const { commission, transaction, affiliate, handling, operations, vat, personalTax, returnShipping } = state.fees;
  const denominator = 1 - commission - transaction - affiliate - vat - personalTax;
  const status = document.querySelector('#pricingStatus');
  const isValidRate = denominator > 0;

  status.textContent = isValidRate ? '' : 'Tổng các tỷ lệ phí phải nhỏ hơn 100% để tính giá hòa vốn.';
  status.classList.toggle('is-error', !isValidRate);

  state.products.forEach((product, index) => {
    const cost = state.baseCost * product.quantity;
    const breakEven = isValidRate
      ? Math.round(((cost + handling + returnShipping + operations) / denominator + product.ads) * 10) / 10
      : NaN;
    const profit = product.salePrice - breakEven;
    const margin = cost !== 0 ? profit / cost : NaN;

    const costCell = document.querySelector(`[data-cost="${index}"]`);
    if (costCell) costCell.textContent = formatMoney(cost);
    document.querySelector(`[data-break-even="${index}"]`).textContent = formatMoney(breakEven);
    document.querySelector(`[data-profit="${index}"]`).textContent = formatMoney(profit);
    document.querySelector(`[data-margin="${index}"]`).textContent = Number.isFinite(margin)
      ? `${percentFormatter.format(margin * 100)}%`
      : '—';
    document.querySelector(`[data-profit="${index}"]`).classList.toggle('is-loss', profit < 0);
  });
}

function calculateShippingFee(weight, tiers) {
  const [first, second, third, fourth] = tiers;
  if (weight <= first.threshold) return first.rate;
  if (weight < second.threshold) return first.rate + (weight - first.threshold) * second.rate;
  if (weight < third.threshold) {
    return first.rate
      + (second.threshold - first.threshold) * second.rate
      + (weight - second.threshold - first.threshold) * third.rate;
  }
  return first.rate
    + (second.threshold - first.threshold) * second.rate
    + (third.threshold - second.threshold - first.threshold) * third.rate
    + (weight - third.threshold - second.threshold - first.threshold) * fourth.rate;
}

function updateShipping() {
  const { length, width, height, weight, quantity, itemPrice, domesticFee, exchangeRate, tiers } = state.shipping;
  const actualWeight = quantity * weight;
  const volume = length * width * height * quantity;
  const volumeWeight = volume / 6000;
  const maxWeight = Math.max(actualWeight, volumeWeight);
  const chargeableWeight = maxWeight <= 1 ? maxWeight : Math.ceil(maxWeight);
  const feePerKg = calculateShippingFee(chargeableWeight, tiers);
  const shippingCost = exchangeRate * feePerKg;
  const domesticCost = domesticFee * exchangeRate;
  const goodsCost = itemPrice * quantity * exchangeRate;
  const totalCost = goodsCost + domesticCost + shippingCost;
  const costPerItem = quantity !== 0 ? totalCost / quantity : NaN;

  const status = document.querySelector('#shippingStatus');
  const isValid = quantity > 0 && tiers.every((tier) => Number.isFinite(tier.threshold) && Number.isFinite(tier.rate));
  status.textContent = quantity > 0 ? '' : 'Số lượng phải lớn hơn 0 để tính giá nhập mỗi sản phẩm.';
  status.classList.toggle('is-error', !isValid);

  document.querySelector('#shippingResults').innerHTML = [
    ['Cân nặng thực', `${detailFormatter.format(actualWeight)} kg`],
    ['Thể tích tổng', `${detailFormatter.format(volume)} cm³`],
    ['Cân nặng thể tích', `${detailFormatter.format(volumeWeight)} kg`],
    ['Cân tính phí', `${detailFormatter.format(chargeableWeight)} kg`],
    ['Phí vận chuyển quốc tế', `${formatMoney(shippingCost)} đ`],
    ['Tổng chi phí nhập', `${formatMoney(totalCost)} đ`],
    ['Giá nhập mỗi sản phẩm', `${formatMoney(costPerItem)} đ`]
  ].map(([label, value]) => `<div class="result-card"><span>${label}</span><strong>${value}</strong></div>`).join('');
}

function updateAll() {
  updatePricing();
  updateShipping();
}

document.querySelector('#settings').addEventListener('input', (event) => {
  const input = event.target.closest('[data-setting]');
  if (!input) return;
  state.fees[input.dataset.setting] = readInputValue(input) / 100;
  updatePricing();
});

document.querySelector('#products').addEventListener('input', (event) => {
  const input = event.target;
  if (input.matches('[data-base-cost]')) {
    state.baseCost = readInputValue(input);
  } else if (input.matches('[data-product]')) {
    state.products[Number(input.dataset.product)][input.dataset.field] = readInputValue(input);
  } else {
    return;
  }
  updatePricing();
});

document.querySelector('#shippingInputs').addEventListener('input', (event) => {
  const input = event.target.closest('[data-shipping]');
  if (!input) return;
  state.shipping[input.dataset.shipping] = readInputValue(input);
  updateShipping();
});

document.querySelector('#shippingTiers').addEventListener('input', (event) => {
  const input = event.target.closest('[data-tier]');
  if (!input) return;
  state.shipping.tiers[Number(input.dataset.tier)][input.dataset.field] = readInputValue(input);
  updateShipping();
});

document.querySelector('#resetButton').addEventListener('click', () => {
  state = makeInitialState();
  renderInputs();
  updateAll();
});

renderInputs();
updateAll();
