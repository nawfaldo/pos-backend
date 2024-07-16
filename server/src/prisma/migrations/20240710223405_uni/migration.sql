/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Outlet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Outlet_name_key` ON `Outlet`(`name`);
