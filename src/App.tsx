import { useState, useEffect } from "react";
import useLocalStorageState from "use-local-storage-state";
import styled from "styled-components";
import {
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RestaurantIcon from "@mui/icons-material/Restaurant";

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface Recipe {
  id: number;
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  servings: number;
}

const AppContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  background: linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%);
  min-height: 100vh;
  color: white;
`;

const StyledButton = styled(Button)`
  && {
    margin-top: 1rem;
    background-color: #4CAF50;
    &:hover {
      background-color: #45a049;
    }
  }
`;

const StyledList = styled(List)`
  && {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 1rem;
    margin-top: 2rem;
  }
`;

const StyledListItem = styled(ListItem)`
  && {
    background-color: rgba(255, 255, 255, 0.2);
    margin-bottom: 0.5rem;
    border-radius: 4px;
  }
`;

const StyledTextField = styled(TextField)`
  && {
    margin-bottom: 1rem;
    .MuiInputBase-root {
      color: white;
    }
    .MuiInputLabel-root {
      color: rgba(255, 255, 255, 0.7);
    }
    .MuiOutlinedInput-notchedOutline {
      border-color: rgba(255, 255, 255, 0.5);
    }
  }
`;

function App() {
  const [recipes, setRecipes] = useLocalStorageState<Recipe[]>("recipes", {
    defaultValue: [],
  });
  const [newRecipeName, setNewRecipeName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [servingsMultiplier, setServingsMultiplier] = useState(1);

  useEffect(() => {
    if (recipes.length === 0) {
      const boilerplateRecipes: Recipe[] = [
        {
          id: 1,
          name: "Spaghetti Carbonara",
          ingredients: [
            { name: "Spaghetti", amount: 400, unit: "g" },
            { name: "Pancetta", amount: 150, unit: "g" },
            { name: "Eggs", amount: 4, unit: "" },
            { name: "Parmesan cheese", amount: 100, unit: "g" },
          ],
          instructions: "1. Cook pasta. 2. Fry pancetta. 3. Mix eggs and cheese. 4. Combine all ingredients.",
          servings: 4,
        },
        {
          id: 2,
          name: "Chicken Stir Fry",
          ingredients: [
            { name: "Chicken breast", amount: 500, unit: "g" },
            { name: "Mixed vegetables", amount: 400, unit: "g" },
            { name: "Soy sauce", amount: 3, unit: "tbsp" },
          ],
          instructions: "1. Cut chicken. 2. Stir fry vegetables. 3. Add chicken and soy sauce. 4. Cook until done.",
          servings: 3,
        },
        {
          id: 3,
          name: "Greek Salad",
          ingredients: [
            { name: "Cucumber", amount: 1, unit: "" },
            { name: "Tomatoes", amount: 4, unit: "" },
            { name: "Red onion", amount: 1, unit: "" },
            { name: "Feta cheese", amount: 200, unit: "g" },
            { name: "Olive oil", amount: 3, unit: "tbsp" },
          ],
          instructions: "1. Chop vegetables. 2. Crumble feta. 3. Mix all ingredients. 4. Drizzle with olive oil.",
          servings: 4,
        },
        {
          id: 4,
          name: "Banana Smoothie",
          ingredients: [
            { name: "Bananas", amount: 2, unit: "" },
            { name: "Milk", amount: 250, unit: "ml" },
            { name: "Honey", amount: 1, unit: "tbsp" },
          ],
          instructions: "1. Peel bananas. 2. Blend all ingredients until smooth.",
          servings: 2,
        },
        {
          id: 5,
          name: "Guacamole",
          ingredients: [
            { name: "Avocados", amount: 3, unit: "" },
            { name: "Lime juice", amount: 2, unit: "tbsp" },
            { name: "Red onion", amount: 0.5, unit: "" },
            { name: "Cilantro", amount: 2, unit: "tbsp" },
          ],
          instructions: "1. Mash avocados. 2. Chop onion and cilantro. 3. Mix all ingredients. 4. Season to taste.",
          servings: 4,
        },
      ];
      setRecipes(boilerplateRecipes);
    }
  }, [recipes, setRecipes]);

  const handleAddRecipe = () => {
    if (newRecipeName.trim() !== "") {
      const newRecipe: Recipe = {
        id: Date.now(),
        name: newRecipeName.trim(),
        ingredients: [],
        instructions: "",
        servings: 1,
      };
      setRecipes([...recipes, newRecipe]);
      setNewRecipeName("");
    }
  };

  const handleDeleteRecipe = (id: number) => {
    setRecipes(recipes.filter((recipe) => recipe.id !== id));
  };

  const handleEditRecipe = (id: number) => {
    const recipeToEdit = recipes.find((recipe) => recipe.id === id);
    if (recipeToEdit) {
      setEditingId(id);
      setEditRecipe({ ...recipeToEdit });
      setServingsMultiplier(1);
    }
  };

  const handleUpdateRecipe = () => {
    if (editRecipe) {
      setRecipes(
        recipes.map((recipe) =>
          recipe.id === editRecipe.id ? { ...editRecipe } : recipe
        )
      );
    }
    setEditingId(null);
    setEditRecipe(null);
  };

  const handleServingsChange = (event: Event, newValue: number | number[]) => {
    if (editRecipe) {
      const multiplier = (newValue as number) / editRecipe.servings;
      setServingsMultiplier(multiplier);
      setEditRecipe({
        ...editRecipe,
        ingredients: editRecipe.ingredients.map((ingredient) => ({
          ...ingredient,
          amount: Number((ingredient.amount * multiplier).toFixed(2)),
        })),
        servings: newValue as number,
      });
    }
  };

  return (
    <AppContainer>
      <Typography variant="h4" component="h1" gutterBottom>
        <RestaurantIcon fontSize="large" /> Recipe Book
      </Typography>
      <StyledTextField
        fullWidth
        variant="outlined"
        label="New Recipe Name"
        value={newRecipeName}
        onChange={(e) => setNewRecipeName(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleAddRecipe()}
      />
      <StyledButton
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleAddRecipe}
      >
        Add Recipe
      </StyledButton>
      <StyledList>
        {recipes.map((recipe) => (
          <StyledListItem key={recipe.id}>
            <ListItemText primary={recipe.name} />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleEditRecipe(recipe.id)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDeleteRecipe(recipe.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </StyledListItem>
        ))}
      </StyledList>
      <Dialog open={editingId !== null} onClose={() => setEditingId(null)} fullWidth maxWidth="md">
        <DialogTitle>{editRecipe?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Ingredients</Typography>
          <List>
            {editRecipe?.ingredients.map((ingredient, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${ingredient.name}: ${ingredient.amount} ${ingredient.unit}`}
                />
              </ListItem>
            ))}
          </List>
          <Typography variant="h6">Instructions</Typography>
          <Typography>{editRecipe?.instructions}</Typography>
          <Typography variant="h6" style={{ marginTop: '1rem' }}>Adjust Servings</Typography>
          <Slider
            value={editRecipe?.servings || 1}
            onChange={handleServingsChange}
            aria-labelledby="servings-slider"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={10}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingId(null)}>Cancel</Button>
          <Button onClick={handleUpdateRecipe} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </AppContainer>
  );
}

export default App;
