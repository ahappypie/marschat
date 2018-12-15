package io.github.ahappypie.marschat

import java.time.{Instant, LocalDateTime, ZoneId}

import akka.actor.{Actor, Props}
import io.github.ahappypie.marschat.grpc.delay.{LightDelayRequest, LightDelayResponse}

/**
  * Inspired by Emory Department of Physics
  * www.physics.emory.edu/astronomy/events/mars/calc.html
 */

object DelayActor {
  def props: Props = Props(new DelayActor)
}

class DelayActor extends Actor {
  override def receive: Receive = {
    case req: LightDelayRequest =>
      sender ! LightDelayResponse(delay(req.timestamp))
  }

  def delay(timestamp: Long): Int = {
    val jd = julianDate(timestamp)
    val earth = earthHelio(jd)
    val mars = marsHelio(jd)
    val d = distance(earth, mars, jd)
    val lt = lightTime(d)

    val jd2 = jd - lt
    val earth2 = earthHelio(jd2)
    val mars2 = marsHelio(jd2)
    val d2 = distance(earth2, mars2, jd2)
    val lt2 = lightTime(d2)

    Math.round(lt2 * 1440 * 60 * 1000).toInt
  }

  def julianDate(timestamp: Long): Double = {
    val date = LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneId.of("Z"))
    var year = date.getYear
    var month = date.getMonthValue
    if(month < 3) {
      year = year - 1
      month = month + 12
    }
    val day = date.getDayOfMonth
    val hour = date.getHour
    val min = date.getMinute
    val sec = date.getSecond

    val A = year/100
    val B = 2 - A + (A/4)
    val E = (hour/24) + (min/1440) + (sec/(8.64*Math.pow(10,4)))

    (365.25 * (year+4716)) + (30.6001*(month+1)) + day + B - 1524.5 + E
  }

  def calc_series(array: Array[(Double, Double, Double)], t: Double): Double = {
    var value = 0.0
    for(tuple <- array) {
      value += tuple._1 * Math.cos(tuple._2 + (tuple._3*t))
    }
    value
  }

  def earthHelio(jd: Double): (Double, Double, Double) = {
    val t = (jd - 2451545.0)/365250.0
    val t2 = t*t
    val t3 = t2*t
    val t4 = t3*t
    val t5 = t4*t

    val L0 = calc_series(vsop87.earth.el0.el0, t)
    val L1 = calc_series(vsop87.earth.el1.el1, t)
    val L2 = calc_series(vsop87.earth.el2.el2, t)
    val L3 = calc_series(vsop87.earth.el3.el3, t)
    val L4 = calc_series(vsop87.earth.el4.el4, t)
    val L5 = calc_series(vsop87.earth.el5.el5, t)
    val L = (L0 + L1 * t + L2 * t2 + L3 * t3 + L4 * t4 + L5 * t5)

    val B0 = calc_series(vsop87.earth.eb0.eb0, t)
    val B1 = calc_series(vsop87.earth.eb1.eb1, t)
    val B2 = calc_series(vsop87.earth.eb2.eb2, t)
    val B3 = calc_series(vsop87.earth.eb3.eb3, t)
    val B4 = calc_series(vsop87.earth.eb4.eb4, t)
    val B5 = calc_series(vsop87.earth.eb5.eb5, t)
    val B = (B0 + B1 * t + B2 * t2 + B3 * t3 + B4 * t4 + B5 * t5)

    val R0 = calc_series(vsop87.earth.er0.er0, t)
    val R1 = calc_series(vsop87.earth.er1.er1, t)
    val R2 = calc_series(vsop87.earth.er2.er2, t)
    val R3 = calc_series(vsop87.earth.er3.er3, t)
    val R4 = calc_series(vsop87.earth.er4.er4, t)
    val R5 = calc_series(vsop87.earth.er5.er5, t)
    val R = (R0 + R1 * t + R2 * t2 + R3 * t3 + R4 * t4 + R5 * t5)

    (L,B,R)
  }

  def marsHelio(jd: Double): (Double, Double, Double) = {
    val t = (jd - 2451545.0)/365250.0
    val t2 = t*t
    val t3 = t2*t
    val t4 = t3*t
    val t5 = t4*t

    val L0 = calc_series(vsop87.mars.ml0.ml0, t)
    val L1 = calc_series(vsop87.mars.ml1.ml1, t)
    val L2 = calc_series(vsop87.mars.ml2.ml2, t)
    val L3 = calc_series(vsop87.mars.ml3.ml3, t)
    val L4 = calc_series(vsop87.mars.ml4.ml4, t)
    val L5 = calc_series(vsop87.mars.ml5.ml5, t)
    val L = (L0 + L1 * t + L2 * t2 + L3 * t3 + L4 * t4 + L5 * t5)

    val B0 = calc_series(vsop87.mars.mb0.mb0, t)
    val B1 = calc_series(vsop87.mars.mb1.mb1, t)
    val B2 = calc_series(vsop87.mars.mb2.mb2, t)
    val B3 = calc_series(vsop87.mars.mb3.mb3, t)
    val B4 = calc_series(vsop87.mars.mb4.mb4, t)
    val B5 = calc_series(vsop87.mars.mb5.mb5, t)
    val B = (B0 + B1 * t + B2 * t2 + B3 * t3 + B4 * t4 + B5 * t5)

    val R0 = calc_series(vsop87.mars.mr0.mr0, t)
    val R1 = calc_series(vsop87.mars.mr1.mr1, t)
    val R2 = calc_series(vsop87.mars.mr2.mr2, t)
    val R3 = calc_series(vsop87.mars.mr3.mr3, t)
    val R4 = calc_series(vsop87.mars.mr4.mr4, t)
    val R5 = calc_series(vsop87.mars.mr5.mr5, t)
    val R = (R0 + R1 * t + R2 * t2 + R3 * t3 + R4 * t4 + R5 * t5)

    (L,B,R)
  }
  //In AU
  def distance(earth: (Double, Double, Double), mars: (Double, Double, Double), jd: Double): Double = {
    val x = (mars._3 * Math.cos(mars._2) * Math.cos(mars._1)) - (earth._3 * Math.cos(earth._1) * Math.cos(earth._2))
    val y = (mars._3 * Math.cos(mars._2) * Math.sin(mars._1)) - (earth._3 * Math.sin(earth._1) * Math.cos(earth._2))
    val z = (mars._3 * Math.sin(mars._2)) - (earth._3 * Math.sin(earth._2))

    val t = (jd - 2451545.0)/365250.0
    val Q = 3.8048177 + (8399.711184 * t)
    val u = x - (Math.cos(Q) * 0.0000312)
    val v = y - (Math.sin(Q) * 0.0000286)
    val w = z - (Math.sin(Q) * 0.0000124)

    Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2) + Math.pow(w, 2))
  }
  //In days
  def lightTime(distance: Double): Double = {
    distance * .0057755183
  }
}
