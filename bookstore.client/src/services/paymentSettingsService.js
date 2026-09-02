import { API_BASE_URL } from "./api";

const getToken = () => localStorage.getItem("token");

export const getPaymentSettings = async () => {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/api/PaymentSettings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.Message ||
        "Failed to fetch payment settings."
    );
  }

  return data;
};

export const addPaymentSetting = async (paymentType, amount) => {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/api/PaymentSettings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
    body: JSON.stringify({
      paymentType,
      amount,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.Message ||
        "Failed to add payment setting."
    );
  }

  return data;
};

export const updatePaymentSetting = async (id, amount) => {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/api/PaymentSettings/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },
      body: JSON.stringify({
        amount,
      }),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.Message ||
        "Failed to update payment setting."
    );
  }

  return data;
};


export const updateSubmissionPrices = async ({
  storyPrice,
  poetryPrice,
  specialPrice,
}) => {
  const settings = await getPaymentSettings();

  const prices = [
    {
      paymentType: "Story",
      amount: storyPrice,
    },
    {
      paymentType: "Poetry",
      amount: poetryPrice,
    },
    {
      paymentType: "Special",
      amount: specialPrice,
    },
  ];

  for (const item of prices) {
    const existingSetting = settings.find(
      (setting) =>
        setting.paymentType?.toLowerCase() ===
        item.paymentType.toLowerCase()
    );

    if (existingSetting) {
      await updatePaymentSetting(
        existingSetting.paymentSettingsId,
        Number(item.amount)
      );
    } else {
      await addPaymentSetting(
        item.paymentType,
        Number(item.amount)
      );
    }
  }

  return await getPaymentSettings();
};