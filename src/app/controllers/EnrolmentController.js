import Queue from '../../lib/Queue';
import EnrolmentMail from '../jobs/EnrolmentMail';
import Enrolment from '../models/Enrolment';

class EnrolmentController {
  async index(request, response) {
    const enrolments = await Enrolment.findAll({
      include: [
        { association: 'student', attributes: ['id', 'name', 'email'] },
        {
          association: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
      ],
      order: [['start_date', 'DESC']],
    });
    return response.json(enrolments);
  }

  async store(request, response) {
    const { start_date, plan_id, student_id } = request.body;
    const { plan, end_date } = request;
    const price = plan.price * plan.duration;

    const { id } = await Enrolment.create({
      plan_id,
      student_id,
      price,
      start_date,
      end_date,
    });

    const enrolment = await Enrolment.findByPk(id, {
      include: ['student', 'plan'],
    });

    await Queue.add(EnrolmentMail.key, {
      enrolment,
    });

    return response.json(enrolment);
  }

  async update(request, response) {
    const { id: plan_id } = request.plan;
    const { enrolment, end_date } = request;
    const { start_date } = request.body;

    await enrolment.update({
      plan_id,
      start_date,
      end_date,
    });

    return response.json(enrolment);
  }

  async delete(request, response) {
    const { id } = request.params;
    await Enrolment.destroy({ where: { id } });
    return response.json({ message: 'Enrolment successfully canceled' });
  }
}

export default new EnrolmentController();
