package io.github.ahappypie.marschat

import java.time.{Instant, LocalDateTime, ZoneId}

import akka.actor.{Actor, Props}
import io.github.ahappypie.marschat.grpc.delay.{LightDelayRequest, LightDelayResponse}

/**
 * Inspired by Emory Department of Physics
 * www.physics.emory.edu/astronomy/events/mars/calc.html
 */

object JupiterDelayActor {
  def props: Props = Props(new JupiterDelayActor)
}

class JupiterDelayActor extends Actor {
  override def receive: Receive = {
    case req: LightDelayRequest =>
      sender ! LightDelayResponse(delay(req.timestamp))
  }

  def delay(timestamp: Long): Int = {
    val jd = julianDate(timestamp)
    val earth = earthHelio(jd)
    val jupiter = jupiterHelio(jd)
    val d = distance(earth, jupiter, jd)
    val lt = lightTime(d)

    val jd2 = jd - lt
    val earth2 = earthHelio(jd2)
    val jupiter2 = jupiterHelio(jd2)
    val d2 = distance(earth2, jupiter2, jd2)
    val lt2 = lightTime(d2)

    //delay in ms
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

    val L0 = calc_series(vsop87.earth.long.l0, t)
    val L1 = calc_series(vsop87.earth.long.l1, t)
    val L2 = calc_series(vsop87.earth.long.l2, t)
    val L3 = calc_series(vsop87.earth.long.l3, t)
    val L4 = calc_series(vsop87.earth.long.l4, t)
    val L5 = calc_series(vsop87.earth.long.l5, t)
    val L = (L0 + L1 * t + L2 * t2 + L3 * t3 + L4 * t4 + L5 * t5)

    val B0 = calc_series(vsop87.earth.lat.b0, t)
    val B1 = calc_series(vsop87.earth.lat.b1, t)
    val B2 = calc_series(vsop87.earth.lat.b2, t)
    val B3 = calc_series(vsop87.earth.lat.b3, t)
    val B4 = calc_series(vsop87.earth.lat.b4, t)
    val B5 = calc_series(vsop87.earth.lat.b5, t)
    val B = (B0 + B1 * t + B2 * t2 + B3 * t3 + B4 * t4 + B5 * t5)

    val R0 = calc_series(vsop87.earth.rad.r0, t)
    val R1 = calc_series(vsop87.earth.rad.r1, t)
    val R2 = calc_series(vsop87.earth.rad.r2, t)
    val R3 = calc_series(vsop87.earth.rad.r3, t)
    val R4 = calc_series(vsop87.earth.rad.r4, t)
    val R5 = calc_series(vsop87.earth.rad.r5, t)
    val R = (R0 + R1 * t + R2 * t2 + R3 * t3 + R4 * t4 + R5 * t5)

    (L,B,R)
  }

  def jupiterHelio(jd: Double): (Double, Double, Double) = {
    val t = (jd - 2451545.0)/365250.0
    val t2 = t*t
    val t3 = t2*t
    val t4 = t3*t
    val t5 = t4*t

    val L0 = calc_series(vsop87.jupiter.long.l0, t)
    val L1 = calc_series(vsop87.jupiter.long.l1, t)
    val L2 = calc_series(vsop87.jupiter.long.l2, t)
    val L3 = calc_series(vsop87.jupiter.long.l3, t)
    val L4 = calc_series(vsop87.jupiter.long.l4, t)
    val L5 = calc_series(vsop87.jupiter.long.l5, t)
    val L = (L0 + L1 * t + L2 * t2 + L3 * t3 + L4 * t4 + L5 * t5)

    val B0 = calc_series(vsop87.jupiter.lat.b0, t)
    val B1 = calc_series(vsop87.jupiter.lat.b1, t)
    val B2 = calc_series(vsop87.jupiter.lat.b2, t)
    val B3 = calc_series(vsop87.jupiter.lat.b3, t)
    val B4 = calc_series(vsop87.jupiter.lat.b4, t)
    val B5 = calc_series(vsop87.jupiter.lat.b5, t)
    val B = (B0 + B1 * t + B2 * t2 + B3 * t3 + B4 * t4 + B5 * t5)

    val R0 = calc_series(vsop87.jupiter.rad.r0, t)
    val R1 = calc_series(vsop87.jupiter.rad.r1, t)
    val R2 = calc_series(vsop87.jupiter.rad.r2, t)
    val R3 = calc_series(vsop87.jupiter.rad.r3, t)
    val R4 = calc_series(vsop87.jupiter.rad.r4, t)
    val R5 = calc_series(vsop87.jupiter.rad.r5, t)
    val R = (R0 + R1 * t + R2 * t2 + R3 * t3 + R4 * t4 + R5 * t5)

    (L,B,R)
  }
  //In AU
  def distance(earth: (Double, Double, Double), jupiter: (Double, Double, Double), jd: Double): Double = {
    val x = (jupiter._3 * Math.cos(jupiter._2) * Math.cos(jupiter._1)) - (earth._3 * Math.cos(earth._1) * Math.cos(earth._2))
    val y = (jupiter._3 * Math.cos(jupiter._2) * Math.sin(jupiter._1)) - (earth._3 * Math.sin(earth._1) * Math.cos(earth._2))
    val z = (jupiter._3 * Math.sin(jupiter._2)) - (earth._3 * Math.sin(earth._2))

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
