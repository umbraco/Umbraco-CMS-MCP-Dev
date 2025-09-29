import { UmbracoManagementClient } from "@umb-management-client";
import { HealthCheckActionRequestModel } from "@/umb-management-api/schemas/index.js";
import { postHealthCheckExecuteActionBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { HealthTestHelper } from "./health-test-helper.js";

export class HealthCheckActionBuilder {
  private model: Partial<HealthCheckActionRequestModel> = {
    valueRequired: false,
  };
  private executed: boolean = false;

  withHealthCheck(id: string): HealthCheckActionBuilder {
    this.model.healthCheck = { id };
    return this;
  }

  withAlias(alias: string): HealthCheckActionBuilder {
    this.model.alias = alias;
    return this;
  }

  withName(name: string): HealthCheckActionBuilder {
    this.model.name = name;
    return this;
  }

  withDescription(description: string): HealthCheckActionBuilder {
    this.model.description = description;
    return this;
  }

  withValueRequired(required: boolean): HealthCheckActionBuilder {
    this.model.valueRequired = required;
    return this;
  }

  withProvidedValue(value: string): HealthCheckActionBuilder {
    this.model.providedValue = value;
    return this;
  }

  withProvidedValueValidation(validation: string): HealthCheckActionBuilder {
    this.model.providedValueValidation = validation;
    return this;
  }

  withProvidedValueValidationRegex(regex: string): HealthCheckActionBuilder {
    this.model.providedValueValidationRegex = regex;
    return this;
  }

  withActionParameters(parameters: { [key: string]: unknown }): HealthCheckActionBuilder {
    this.model.actionParameters = parameters;
    return this;
  }

  build(): HealthCheckActionRequestModel {
    return postHealthCheckExecuteActionBody.parse(this.model);
  }

  /**
   * Creates (executes) a health check action.
   * WARNING: This can modify system state! Use only with safe test actions.
   */
  async create(): Promise<HealthCheckActionBuilder> {
    // Safety check: only allow execution if we have a safe test environment
    if (!this.isSafeForTesting()) {
      throw new Error("Health check action is not safe for testing environment");
    }

    const client = UmbracoManagementClient.getClient();
    const validatedModel = this.build();

    // Execute the health check action
    await client.postHealthCheckExecuteAction(validatedModel);
    this.executed = true;

    return this;
  }

  /**
   * Verifies if the action was executed successfully
   * Since health check actions don't return persistent entities,
   * this method checks if the execution completed without error
   */
  async verify(): Promise<boolean> {
    return this.executed;
  }

  /**
   * Gets the validation status of the current model
   */
  getValidationStatus(): boolean {
    try {
      postHealthCheckExecuteActionBody.parse(this.model);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Checks if the action is safe for testing
   * This is a safety mechanism to prevent destructive actions in test environment
   */
  private isSafeForTesting(): boolean {
    // Only allow actions that are explicitly marked as safe for testing
    const safeAliases = [
      'test-action',
      'info-action',
      'check-action',
      'validate-action',
    ];

    const alias = this.model.alias?.toLowerCase() || '';
    const name = this.model.name?.toLowerCase() || '';
    const description = this.model.description?.toLowerCase() || '';

    // Check if the action appears to be safe based on naming
    const isSafeAlias = safeAliases.some(safe => alias.includes(safe));
    const isReadOnly = name.includes('check') || name.includes('test') || name.includes('info');
    const isNotDestructive = !description.includes('delete') &&
                            !description.includes('remove') &&
                            !description.includes('modify') &&
                            !description.includes('change');

    return isSafeAlias || (isReadOnly && isNotDestructive);
  }

  /**
   * Cleanup method - Health check actions are typically temporary operations,
   * so this primarily resets the builder state
   */
  async cleanup(): Promise<void> {
    this.executed = false;
    // Health check actions typically don't create persistent entities to clean up
    console.log('Health check action cleanup completed');
  }

  /**
   * Static method to create a builder from an existing action
   * This is useful when testing with real health check actions found in the system
   */
  static fromAction(action: HealthCheckActionRequestModel): HealthCheckActionBuilder {
    const builder = new HealthCheckActionBuilder();
    builder.model = { ...action };
    return builder;
  }

  /**
   * Static method to create a safe test action builder
   */
  static createSafeTestAction(): HealthCheckActionBuilder {
    return new HealthCheckActionBuilder()
      .withAlias('test-action')
      .withName('Test Action')
      .withDescription('Safe test action for unit testing')
      .withValueRequired(false);
  }
}