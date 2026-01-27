import { Request, Response } from "express";
import { ICategoryService } from "./category.interface";

export class CategoryController {
  constructor(private readonly categoryService: ICategoryService) { }

  getAllCategories = async (req: Request, res: Response): Promise<void> => {
    const categories = await this.categoryService.getAllCategories();
    res.json(categories);
  };

  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    const publicId = req.params.id;
    const category = await this.categoryService.getCategoryById(publicId);
    res.json(category);
  };

  createCategory = async (req: Request, res: Response): Promise<void> => {
    const categoryData = req.body;
    const newCategory =
      await this.categoryService.createCategory(categoryData);
    res.status(201).json(newCategory);
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    const publicId = req.params.id;
    const categoryData = req.body;
    const updatedCategory = await this.categoryService.updateCategory(
      publicId,
      categoryData,
    );
    res.json(updatedCategory);
  };

  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    const publicId = req.params.id;
    const deleted = await this.categoryService.deleteCategory(publicId);
    res.status(200).json(deleted);
  };
}
