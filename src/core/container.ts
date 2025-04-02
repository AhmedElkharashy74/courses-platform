// src/core/container.ts
import 'reflect-metadata';
import { container as tsyringeContainer, DependencyContainer } from 'tsyringe';
import { MongoConnection } from './config/db';
import { RedisConnection } from './config/redis';
import { GoogleStrategy } from '../modules/auth/strategies/google.strategy';
import { FacebookStrategy } from '../modules/auth/strategies/facebook.strategy';
import GitHubStrategy from '../modules/auth/strategies/github.strategy';
import { AuthService } from '../modules/auth/auth.service';
import { UserRepository } from '../modules/users/user.repository';
// import { UserService } from '../modules/user/user.service';
// import { UserController } from '../modules/user/user.controller';
// import { CourseRepository } from '../modules/course/course.repository';
// import { CourseService } from '../modules/course/course.service';
// import { CourseController } from '../modules/course/course.controller';

// Extend the default container interface for type safety
interface ApplicationContainer extends DependencyContainer {
  // Add custom bindings here if needed
}

const container: ApplicationContainer = tsyringeContainer;

// Database connections
container.registerSingleton('MongoConnection', MongoConnection);
container.registerSingleton('RedisConnection', RedisConnection);


//auth module
container.register('GitHubStrategy', {useClass: GitHubStrategy});
container.register(AuthService, {
  useClass: AuthService
});
container.register('GoogleStrategy', {
  useClass: GoogleStrategy
});
container.register('FacebookStrategy', {
  useClass: FacebookStrategy
});

// // User module
container.register('UserRepository', {
  useClass: UserRepository
});
// container.register('UserService', {
//   useClass: UserService
// });
// container.register('UserController', {
//   useClass: UserController
// });

// // Course module
// container.register('CourseRepository', {
//   useClass: CourseRepository
// });
// container.register('CourseService', {
//   useClass: CourseService
// });
// container.register('CourseController', {
//   useClass: CourseController
// });

/**
 * Initialize all database connections
 */
async function initializeDB(): Promise<void> {
  try {
    // Connect to all databases
    await container.resolve(MongoConnection).connect();
    await container.resolve(RedisConnection)
    
    console.log('✅ All database connections established');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}



export { container, initializeDB,  };