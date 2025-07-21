const crypto = require('crypto');

const clientId = 'zpmc_mctest';
const requestId = '45664645645645';
const secretKey = 'NyVcskn8Tf2wx9jokOfiG3PeW0upYZpj'; // do ZaloPay cấp

const payloadObj = {
  zalo_oa_id: '1365410903334518373',
  phone: '84367134806',
  content: {
    template_id: 340406,
    template_data: {
      customer_name: 'Sang1234',
      phone: '84765663616',
      day: 'today',
      total_amount: '1.000.000',
      order_code: 'code_1',
      order_status: '1',
    },
  },
  callback_url: 'http://cms.zalopay.test/zns/v1/callback',
};

const payload = JSON.stringify(payloadObj);
const data = `${clientId}|${requestId}|${payload}`;
console.log('Data to hash:', data);

const hmac = crypto.createHmac('sha256', secretKey);
hmac.update(data);
const xClientHash = hmac.digest('hex');

console.log(xClientHash);
