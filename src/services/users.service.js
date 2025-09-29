const API_URL = import.meta.env.VITE_BASE_URL;

export const registerAdmin = async (adminData) => {
  try {
    const response = await fetch(`${API_URL}/users/admin/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Username: adminData.Username,
        Email: adminData.Email,
        FirstName: adminData.FirstName,
        LastName: adminData.LastName,
        Password: adminData.Password,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Admin registration failed:", error);
    throw error;
  }
};
