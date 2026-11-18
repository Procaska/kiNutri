// Instâncias compartilhadas pelos controllers. JWT consultado a cada requisição.
const userService = new UserService();
const foodService = new FoodService();
const dietService = new DietService();
