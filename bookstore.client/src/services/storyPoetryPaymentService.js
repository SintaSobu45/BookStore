import { API_BASE_URL } from './api';


// =========================================================
// CREATE STORY / POETRY PAYMENT
// =========================================================

export const createStoryPoetryPayment = async (
  storyPoetryId
) => {

  const token = localStorage.getItem('token');

  const response = await fetch(
    `${API_BASE_URL}/api/StoryPoetryPayment`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',

        Authorization:
          `Bearer ${token}`
      },

      body: JSON.stringify({
        storyPoetryId: storyPoetryId
      })
    }
  );


  const data = await response.json();


  if (!response.ok) {

    throw new Error(
      data?.message ||
      'Failed to create payment.'
    );

  }


  return data;
};


// =========================================================
// VERIFY STORY / POETRY PAYMENT
// =========================================================

export const verifyStoryPoetryPayment = async (
  paymentId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) => {

  const token = localStorage.getItem('token');


  const response = await fetch(
    `${API_BASE_URL}/api/StoryPoetryPayment/verify`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',

        Authorization:
          `Bearer ${token}`
      },

      body: JSON.stringify({

        paymentId:
          paymentId,

        razorpayOrderId:
          razorpayOrderId,

        razorpayPaymentId:
          razorpayPaymentId,

        razorpaySignature:
          razorpaySignature

      })
    }
  );


  const data = await response.json();


  if (!response.ok) {

    throw new Error(
      data?.message ||
      'Payment verification failed.'
    );

  }


  return data;
};