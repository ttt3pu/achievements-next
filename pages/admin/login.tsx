import { authOptions } from 'pages/api/auth/[...nextauth]';
import { adminEmail } from 'constants/constants';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { signIn } from 'next-auth/react';
import Button from 'components/atoms/Button';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  const email = session?.user?.email;
  console.log(email);

  const roleError = !!(email && email !== 'adminEmail');

  if (email === adminEmail) {
    return {
      redirect: {
        permanent: false,
        destination: '/admin',
      },
    };
  }

  return {
    props: {
      roleError,
    },
  };
};

type Props = {
  roleError: boolean;
};

export default function Login({ roleError }: Props) {
  return (
    <div className="px-5 pb-5">
      <div className="max-w-contents mx-auto pt-5 border-t border-t-bg text-center">
        {roleError && <p className="font-en text-red text-3xl mb-8">Access Denied.</p>}
        <Button onClick={() => signIn('github')}>Sign in</Button>
      </div>
    </div>
  );
}
