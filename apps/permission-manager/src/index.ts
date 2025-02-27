import { FreeTrailPolicy } from './policy/policies/FreetrailPolicy';
import { RegistrationPolicy } from './policy/policies/RegistrationPolicy';
import { PolicyBuilder } from './policy/Policy';

type User = {
  id: string;
  email: string;
  role: string;
};

const accessFreeTrail = async (
  userId: string,
  email: string,
  password: string
) => {
  const policyGroup = PolicyBuilder.create('FreeTrailPolicyGroup')
    .addPolicies([new RegistrationPolicy(), new FreeTrailPolicy()])
    .build();

  const { allowed, reason, name } = await policyGroup.can({
    userId: userId,
    email,
  });

  if (!allowed) {
    console.error(
      `[${name}] User ${userId} cannot access free trial: ${reason}`
    );
    return;
  }

  console.log(`[${name}] User ${userId} can access free trial`);
  return {
    success: true,
    message: `trial access granted for user ${userId}`,
  };
};

accessFreeTrail('user4x', 'user45@example.com', 'securepassword');

