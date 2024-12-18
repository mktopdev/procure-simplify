import { ExpressionOfNeedForm } from "@/components/forms/ExpressionOfNeedForm";
import { PageTransition } from "@/components/ui/PageTransition";

const NewExpression = () => {
  return (
    <PageTransition>
      <ExpressionOfNeedForm />
    </PageTransition>
  );
};

export default NewExpression;