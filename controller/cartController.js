import Cart from "../model/cartModel.js";

// ✅ Add product to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id; // 🔑 JWT middleware
    const { productId, quantity,address } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, quantity, address }] });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity,address });
      }
    }

    await cart.save();
    res.status(200).json({ message: "Product added to cart", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get user cart with total price
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId }).populate("items.productId","productName image price");

    if (!cart) {
      return res.status(200).json({ cartItems: [], totalPrice: 0 });
    }

    // total price calculate
    const totalPrice = cart.items.reduce((total, item) => {
      return total + item.productId.price * item.quantity;
    }, 0);

    res.status(200).json({ cartItems: cart.items, totalPrice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Remove product from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();
    res.status(200).json({ message: "Product removed from cart", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
