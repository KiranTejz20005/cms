import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   * 
   * This automatically sets up public permissions for the Content API.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Auto-configure public permissions for content API
    try {
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (publicRole) {
        // Get current permissions
        const permissions = await strapi
          .query('plugin::users-permissions.permission')
          .findMany({ where: { role: publicRole.id } });

        const existingActions = permissions.map((p: any) => p.action);

        // Define permissions we want to enable for public access
        const contentPermissions = [
          'api::content.content.find',
          'api::content.content.findOne',
        ];

        for (const action of contentPermissions) {
          if (!existingActions.includes(action)) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: publicRole.id,
              },
            });
            console.log(`[Bootstrap] Enabled public permission: ${action}`);
          }
        }
      }
    } catch (error) {
      console.error('[Bootstrap] Error setting up permissions:', error);
    }
  },
};
