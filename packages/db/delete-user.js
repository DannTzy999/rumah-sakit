const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteUser() {
  try {
    const targetEmail = 'minadminmuain@gacor.toto';
    
    // First, check if user exists
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });
    
    if (!user) {
      console.log([NOT FOUND] User with email "" not found in database);
      return;
    }
    
    console.log([FOUND] User: ID=, Email=, Name=);
    
    // Delete the user
    const deletedUser = await prisma.user.delete({
      where: { email: targetEmail },
    });
    
    console.log([SUCCESS] Successfully deleted user with email: );
    console.log([INFO] User ID: );
    console.log([INFO] User Name: );
  } catch (error) {
    console.error([ERROR] Error deleting user:, error.message);
  } finally {
    await prisma.();
  }
}

deleteUser();
